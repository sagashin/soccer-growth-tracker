'use client';

import React, { useState, useEffect } from 'react';
import GeminiApiKeyModal from '@/components/GeminiApiKeyModal';
import FamilyAuthModal from '@/components/FamilyAuthModal';
import FamilyShareModal from '@/components/FamilyShareModal';
import {
  subscribeCloudRecords,
  subscribeCloudSpikes,
  saveCloudRecord,
  deleteCloudRecord,
  saveCloudSpike,
  deleteCloudSpike,
} from '@/lib/cloud-store';
import {
  Key,
  Cloud,
  ClipboardEdit,
  BarChart3,
  Footprints,
  PlusCircle,
  RotateCcw,
  Users,
  ShieldCheck,
} from 'lucide-react';
import {
  INITIAL_RECORDS,
  INITIAL_SPIKES,
  MatchRecord,
  SpikeGear,
  calculateDashboardStats,
} from '@/lib/soccer-tracker';
import NewRecordTab from '@/components/NewRecordTab';
import DashboardTab from '@/components/DashboardTab';
import SpikeGearTab from '@/components/SpikeGearTab';

type ActiveTab = 'record' | 'dashboard' | 'spikes';

const STORAGE_KEY_RECORDS = 'pitchlog_records_v1';
const STORAGE_KEY_SPIKES = 'pitchlog_spikes_v1';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('record');
  const [records, setRecords] = useState<MatchRecord[]>(INITIAL_RECORDS);
  const [spikes, setSpikes] = useState<SpikeGear[]>(INITIAL_SPIKES);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isFamilyShareModalOpen, setIsFamilyShareModalOpen] = useState<boolean>(false);

  // Family passkey authentication state
  const [familyKey, setFamilyKey] = useState<string | null>(null);
  const [currentPasskey, setCurrentPasskey] = useState<string>('');

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Subscribe to Cloud Firestore with local cache fallback once familyKey is authenticated
  useEffect(() => {
    if (!familyKey) return;

    let initialRecords = INITIAL_RECORDS;
    let initialSpikes = INITIAL_SPIKES;

    try {
      const savedRecs = localStorage.getItem(`${STORAGE_KEY_RECORDS}_${familyKey}`);
      if (savedRecs) {
        const p = JSON.parse(savedRecs);
        if (Array.isArray(p) && p.length > 0) initialRecords = p;
      }
      const savedSpk = localStorage.getItem(`${STORAGE_KEY_SPIKES}_${familyKey}`);
      if (savedSpk) {
        const p = JSON.parse(savedSpk);
        if (Array.isArray(p) && p.length > 0) initialSpikes = p;
      }
    } catch (e) {
      console.warn('localStorage load error:', e);
    }

    setRecords(initialRecords);
    setSpikes(initialSpikes);
    setHydrated(true);

    // Real-time bidirectional subscription across devices (father & son phones)
    const unsubRecords = subscribeCloudRecords(familyKey, initialRecords, (cloudRecords) => {
      setRecords(cloudRecords);
      setIsCloudSynced(true);
      try {
        localStorage.setItem(`${STORAGE_KEY_RECORDS}_${familyKey}`, JSON.stringify(cloudRecords));
      } catch (err) {
        console.warn('Cache write failed:', err);
      }
    });

    const unsubSpikes = subscribeCloudSpikes(familyKey, initialSpikes, (cloudSpikes) => {
      setSpikes(cloudSpikes);
      try {
        localStorage.setItem(`${STORAGE_KEY_SPIKES}_${familyKey}`, JSON.stringify(cloudSpikes));
      } catch (err) {
        console.warn('Cache write failed:', err);
      }
    });

    return () => {
      unsubRecords();
      unsubSpikes();
    };
  }, [familyKey]);

  // Reset scroll to top on tab switch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [activeTab]);

  const handleSaveRecord = async (newRecord: MatchRecord) => {
    setRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    if (!familyKey) return;
    try {
      await saveCloudRecord(familyKey, newRecord);
    } catch (err) {
      console.warn('Cloud save fallback to local:', err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (!familyKey) return;
    try {
      await deleteCloudRecord(familyKey, id);
    } catch (err) {
      console.warn('Cloud delete failed:', err);
    }
  };

  const handleAddSpike = async (newSpike: SpikeGear) => {
    setSpikes((prev) => [...prev, newSpike]);
    if (!familyKey) return;
    try {
      await saveCloudSpike(familyKey, newSpike);
    } catch (err) {
      console.warn('Cloud save spike failed:', err);
    }
  };

  const handleDeleteSpike = async (spikeId: string) => {
    setSpikes((prev) => prev.filter((s) => s.id !== spikeId));
    if (!familyKey) return;
    try {
      await deleteCloudSpike(familyKey, spikeId);
    } catch (err) {
      console.warn('Cloud delete spike failed:', err);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('初期サンプルデータにリセットしますか？\n※現在登録されている記録がサンプルデータで置き換わります。')) {
      return;
    }
    if (!familyKey) return;
    setRecords(INITIAL_RECORDS);
    setSpikes(INITIAL_SPIKES);
    try {
      localStorage.setItem(`${STORAGE_KEY_RECORDS}_${familyKey}`, JSON.stringify(INITIAL_RECORDS));
      localStorage.setItem(`${STORAGE_KEY_SPIKES}_${familyKey}`, JSON.stringify(INITIAL_SPIKES));
      for (const r of INITIAL_RECORDS) {
        await saveCloudRecord(familyKey, r).catch(() => {});
      }
      for (const s of INITIAL_SPIKES) {
        await saveCloudSpike(familyKey, s).catch(() => {});
      }
    } catch (e) {
      console.warn('Reset error:', e);
    }
  };

  const handleDisconnect = () => {
    setFamilyKey(null);
    setCurrentPasskey('');
    setRecords([]);
    setSpikes([]);
  };

  // If not authenticated with family passkey, show lock/auth modal
  if (!familyKey) {
    return (
      <FamilyAuthModal
        onAuthenticated={(key, pass) => {
          setFamilyKey(key);
          setCurrentPasskey(pass);
        }}
      />
    );
  }

  const summary = calculateDashboardStats(records);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
      {/* Top Bar following the strict 3-zone contract */}
      <header className="sticky top-0 z-30 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-8 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90 w-full max-w-full safe-top">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('record');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          PitchLog
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="メインナビゲーション"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'record'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            新規記録＆AI分析
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            ダッシュボード＆成長ログ ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spikes')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'spikes'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            スパイク＆ギア管理 ({spikes.length})
          </button>
        </nav>

        {/* Zone 3: Actions + Family Share button + AI Settings button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Family Share / Passkey Button */}
          <button
            type="button"
            onClick={() => setIsFamilyShareModalOpen(true)}
            className="px-2 sm:px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            title="家族共有URLのコピー＆合言葉の確認"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline sm:inline">家族共有</span>
            <span className="xs:hidden sm:hidden">共有</span>
          </button>

          {/* Gemini API Settings */}
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            title="Gemini APIキー設定"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline sm:inline">AI設定</span>
            <span className="xs:hidden sm:hidden">設定</span>
          </button>

          {/* Add Record Primary Button */}
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ＋ 記録
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden">
        {/* Compact Hero & Tab Switcher Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>U-15 JUNIOR YOUTH SOCCER REFLECTION &amp; GROWTH TRACKER</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight text-balance">
                試合の振り返りを「次の1プレーの武器」に変える
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                プレーメモとYouTube動画を紐づけて記録し、AI専属コーチが「技術・戦術・フィジカル・メンタル」の4軸で具体策をフィードバックします。
              </p>
            </div>

            {/* Quick Tab Switcher Pills/Buttons for Desktop & Tablet */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('record')}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'record'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <ClipboardEdit className="w-4 h-4" />
                <span>新規記録＆AI分析</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>ダッシュボード＆成長ログ</span>
                <span className="font-mono tabular-nums opacity-80">({summary.totalMatches})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spikes')}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'spikes'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span>スパイク＆ギア管理</span>
                <span className="font-mono tabular-nums opacity-80">({spikes.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* Active Tab View */}
        {activeTab === 'record' && (
          <NewRecordTab
            spikes={spikes}
            onSaveRecord={handleSaveRecord}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab
            records={records}
            spikes={spikes}
            onDeleteRecord={handleDeleteRecord}
            onUpdateRecord={handleSaveRecord}
            onNavigateToNewRecord={() => setActiveTab('record')}
          />
        )}

        {activeTab === 'spikes' && (
          <SpikeGearTab
            spikes={spikes}
            records={records}
            onAddSpike={handleAddSpike}
            onDeleteSpike={handleDeleteSpike}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 px-4 sm:px-8 py-5 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            PitchLog — ジュニアユース（U-15）サッカー振り返り＆成長トラッカー（家族合言葉保護済）
          </div>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>初期サンプルデータを復元</span>
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (<= 15% total sticky budget with header) */}
      <nav
        aria-label="モバイルタブナビゲーション"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-3 items-center safe-bottom"
      >
        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            activeTab === 'record' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>新規記録＆AI分析</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>成長ログ ({records.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('spikes')}
          className={`h-full flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            activeTab === 'spikes' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Footprints className="w-4 h-4" />
          <span>スパイク管理 ({spikes.length})</span>
        </button>
      </nav>

      {/* Family Share / Passkey Modal */}
      <FamilyShareModal
        isOpen={isFamilyShareModalOpen}
        onClose={() => setIsFamilyShareModalOpen(false)}
        currentPasskey={currentPasskey}
        onDisconnect={handleDisconnect}
      />

      {/* Global Gemini API Key Modal */}
      <GeminiApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
