import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface FamilyAuthConfig {
  isConfigured: boolean;
  verifyHash: string; // SHA256(familyKey + '_pitchlog_verify_v1')
  hint?: string;
  configuredAt?: string;
}

const META_COLLECTION = 'soccer_growth_meta';
const AUTH_DOC = 'family_auth';
export const STORAGE_KEY_PASSKEY = 'pitchlog_family_passkey_v1';

/**
 * Robust cross-browser UTF-8 SHA-256 implementation with pure-JS fallback
 */
export async function computeSha256(text: string): Promise<string> {
  const normalized = text.trim().toLowerCase();
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(normalized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('SubtleCrypto error, falling back to pure JS:', e);
    }
  }
  return jsSha256(normalized);
}

function jsSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  let i: number, j: number;
  let result = '';
  const words: number[] = [];
  
  // Encode UTF-8 bytes to words
  const utf8Bytes: number[] = [];
  for (let c = 0; c < ascii.length; c++) {
    let code = ascii.charCodeAt(c);
    if (code < 0x80) {
      utf8Bytes.push(code);
    } else if (code < 0x800) {
      utf8Bytes.push(0xc0 | (code >> 6));
      utf8Bytes.push(0x80 | (code & 0x3f));
    } else if (code < 0xd800 || code >= 0xe000) {
      utf8Bytes.push(0xe0 | (code >> 12));
      utf8Bytes.push(0x80 | ((code >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (code & 0x3f));
    } else {
      c++;
      code = 0x10000 + (((code & 0x3ff) << 10) | (ascii.charCodeAt(c) & 0x3ff));
      utf8Bytes.push(0xf0 | (code >> 18));
      utf8Bytes.push(0x80 | ((code >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((code >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (code & 0x3f));
    }
  }

  for (i = 0; i < utf8Bytes.length; i++) {
    words[i >> 2] |= utf8Bytes[i] << ((3 - (i % 4)) * 8);
  }
  words[utf8Bytes.length >> 2] |= 0x80 << ((3 - (utf8Bytes.length % 4)) * 8);
  words[(((utf8Bytes.length + 8) >> 6) << 4) + 15] = utf8Bytes.length * 8;

  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    while (w.length < 16) w.push(0);
    const oldHash = [...hash];
    for (j = 0; j < 64; j++) {
      const w15 = w[j - 2] || 0, w2 = w[j - 15] || 0;
      const s0 = (rightRotate(w2, 7) ^ rightRotate(w2, 18) ^ (w2 >>> 3)) >>> 0;
      const s1 = (rightRotate(w15, 17) ^ rightRotate(w15, 19) ^ (w15 >>> 10)) >>> 0;
      w[j] = j < 16 ? (w[j] | 0) : (((w[j - 16] + s0) | 0) + ((w[j - 7] + s1) | 0)) | 0;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 =
        (((hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25))) | 0) +
          ((ch + k[j]) | 0) +
          w[j]) | 0;
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }
    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

/**
 * Derives familyKey (Firestore partition) and verifyHash (stored in meta) from plain passkey.
 */
export async function deriveKeys(passkey: string): Promise<{ familyKey: string; verifyHash: string }> {
  const norm = passkey.trim().toLowerCase();
  const familyKey = await computeSha256(norm + '_pitchlog_family_key_v1');
  const verifyHash = await computeSha256(familyKey + '_pitchlog_verify_v1');
  return { familyKey, verifyHash };
}

/**
 * Fetches current family auth configuration from Firestore.
 */
export async function fetchFamilyAuthConfig(): Promise<FamilyAuthConfig | null> {
  try {
    const snap = await getDoc(doc(db, META_COLLECTION, AUTH_DOC));
    if (snap.exists()) {
      return snap.data() as FamilyAuthConfig;
    }
  } catch (err) {
    console.warn('Error fetching family auth config:', err);
  }
  return null;
}

/**
 * Sets initial family passkey in Firestore.
 */
export async function setupInitialPasskey(
  passkey: string,
  hint?: string
): Promise<{ familyKey: string }> {
  const trimmed = passkey.trim();
  if (trimmed.length < 2) {
    throw new Error('合言葉は2文字以上で入力してください。');
  }
  const { familyKey, verifyHash } = await deriveKeys(trimmed);
  const data: FamilyAuthConfig = {
    isConfigured: true,
    verifyHash,
    hint: hint?.trim() || undefined,
    configuredAt: new Date().toISOString(),
  };
  await setDoc(doc(db, META_COLLECTION, AUTH_DOC), data);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PASSKEY, trimmed);
  }
  return { familyKey };
}

/**
 * Verifies passkey against Firestore config.
 */
export async function verifyPasskey(
  passkey: string,
  config: FamilyAuthConfig
): Promise<{ isValid: boolean; familyKey: string }> {
  const trimmed = passkey.trim();
  const { familyKey, verifyHash } = await deriveKeys(trimmed);
  const isValid = verifyHash === config.verifyHash;
  if (isValid && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_PASSKEY, trimmed);
  }
  return { isValid, familyKey };
}

/**
 * Helper to get currently stored passkey in localStorage.
 */
export function getStoredPasskey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_PASSKEY);
  } catch {
    return null;
  }
}

/**
 * Clears stored passkey from localStorage.
 */
export function clearStoredPasskey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PASSKEY);
  } catch {}
}

