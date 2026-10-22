import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  MatchRecord,
  SpikeGear,
  INITIAL_RECORDS,
  INITIAL_SPIKES,
} from './soccer-tracker';

function getRecordsCol(familyKey: string) {
  return collection(db, 'soccer_growth_families', familyKey, 'records');
}

function getSpikesCol(familyKey: string) {
  return collection(db, 'soccer_growth_families', familyKey, 'spikes');
}

function getMetaDoc(familyKey: string) {
  return doc(db, 'soccer_growth_families', familyKey, 'meta', 'app_init_state');
}

/**
 * Checks if this family has been initialized in Firestore previously.
 */
async function isFamilyAppInitialized(familyKey: string): Promise<boolean> {
  try {
    const metaSnap = await getDoc(getMetaDoc(familyKey));
    return metaSnap.exists() && metaSnap.data()?.seeded === true;
  } catch (e) {
    console.warn('Error checking family init state:', e);
    return false;
  }
}

async function markFamilyAppInitialized(familyKey: string): Promise<void> {
  try {
    await setDoc(getMetaDoc(familyKey), {
      seeded: true,
      initializedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Error marking family init state:', e);
  }
}

/**
 * Migrates existing legacy records (if any) to the family-partitioned storage.
 */
export async function migrateLegacyDataIfNeeded(familyKey: string): Promise<void> {
  try {
    const isInit = await isFamilyAppInitialized(familyKey);
    if (isInit) return;

    const legacyRecCol = collection(db, 'soccer_growth_records');
    const legacySpkCol = collection(db, 'soccer_growth_spikes');
    const [recSnap, spkSnap] = await Promise.all([
      getDocs(legacyRecCol).catch(() => null),
      getDocs(legacySpkCol).catch(() => null),
    ]);

    let migratedAny = false;
    if (recSnap && !recSnap.empty) {
      for (const d of recSnap.docs) {
        await setDoc(doc(getRecordsCol(familyKey), d.id), d.data());
        await deleteDoc(d.ref).catch(() => {});
      }
      migratedAny = true;
    }

    if (spkSnap && !spkSnap.empty) {
      for (const d of spkSnap.docs) {
        await setDoc(doc(getSpikesCol(familyKey), d.id), d.data());
        await deleteDoc(d.ref).catch(() => {});
      }
      migratedAny = true;
    }

    if (migratedAny) {
      await markFamilyAppInitialized(familyKey);
      console.log('Successfully migrated legacy records to family partition.');
    }
  } catch (err) {
    console.warn('Legacy migration notice:', err);
  }
}

/**
 * Subscribes to real-time records updates for the authenticated family.
 */
export function subscribeCloudRecords(
  familyKey: string,
  localFallback: MatchRecord[],
  onUpdate: (records: MatchRecord[]) => void
): () => void {
  if (!familyKey) {
    onUpdate(localFallback);
    return () => {};
  }

  const recordsCol = getRecordsCol(familyKey);

  const unsubscribe = onSnapshot(
    recordsCol,
    async (snapshot) => {
      if (snapshot.empty) {
        await migrateLegacyDataIfNeeded(familyKey);
        const alreadyInit = await isFamilyAppInitialized(familyKey);
        if (!alreadyInit) {
          // Very first initialization for this family: seed
          const seedData = localFallback.length > 0 ? localFallback : INITIAL_RECORDS;
          for (const item of seedData) {
            try {
              await setDoc(doc(getRecordsCol(familyKey), item.id), item);
            } catch (err) {
              console.warn('Failed to seed record:', err);
            }
          }
          await markFamilyAppInitialized(familyKey);
          onUpdate(seedData);
          return;
        }

        // User intentionally deleted all records; do NOT resurrect
        onUpdate([]);
        return;
      }

      markFamilyAppInitialized(familyKey).catch(() => {});

      const list: MatchRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as MatchRecord);
      });

      // Sort by date descending (newest first)
      list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore records subscription error:', error);
      onUpdate(localFallback);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time spikes updates for the authenticated family.
 */
export function subscribeCloudSpikes(
  familyKey: string,
  localFallback: SpikeGear[],
  onUpdate: (spikes: SpikeGear[]) => void
): () => void {
  if (!familyKey) {
    onUpdate(localFallback);
    return () => {};
  }

  const spikesCol = getSpikesCol(familyKey);

  const unsubscribe = onSnapshot(
    spikesCol,
    async (snapshot) => {
      if (snapshot.empty) {
        const alreadyInit = await isFamilyAppInitialized(familyKey);
        if (!alreadyInit) {
          const seedData = localFallback.length > 0 ? localFallback : INITIAL_SPIKES;
          for (const item of seedData) {
            try {
              await setDoc(doc(getSpikesCol(familyKey), item.id), item);
            } catch (err) {
              console.warn('Failed to seed spike:', err);
            }
          }
          onUpdate(seedData);
          return;
        }

        onUpdate([]);
        return;
      }

      const list: SpikeGear[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as SpikeGear);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore spikes subscription error:', error);
      onUpdate(localFallback);
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a match record in Firestore under family partition.
 */
export async function saveCloudRecord(familyKey: string, record: MatchRecord): Promise<void> {
  if (!familyKey) return;
  try {
    await setDoc(doc(getRecordsCol(familyKey), record.id), record);
    await markFamilyAppInitialized(familyKey);
  } catch (err) {
    console.error('Error saving record to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a match record from Firestore under family partition.
 */
export async function deleteCloudRecord(familyKey: string, id: string): Promise<void> {
  if (!familyKey) return;
  try {
    await deleteDoc(doc(getRecordsCol(familyKey), id));
  } catch (err) {
    console.error('Error deleting record from Firestore:', err);
    throw err;
  }
}

/**
 * Saves or updates a spike gear in Firestore under family partition.
 */
export async function saveCloudSpike(familyKey: string, spike: SpikeGear): Promise<void> {
  if (!familyKey) return;
  try {
    await setDoc(doc(getSpikesCol(familyKey), spike.id), spike);
  } catch (err) {
    console.error('Error saving spike to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a spike gear from Firestore under family partition.
 */
export async function deleteCloudSpike(familyKey: string, id: string): Promise<void> {
  if (!familyKey) return;
  try {
    await deleteDoc(doc(getSpikesCol(familyKey), id));
  } catch (err) {
    console.error('Error deleting spike from Firestore:', err);
    throw err;
  }
}
