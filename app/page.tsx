'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardEdit,
  BarChart3,
  Footprints,
  PlusCircle,
  RotateCcw,
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
        }
      } else {
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_RECORDS));
      }

      const savedSpikes = localStorage.getItem(STORAGE_KEY_SPIKES);
      if (savedSpikes) {
        const parsedSpikes = JSON.parse(savedSpikes);
        if (Array.isArray(parsedSpikes) && parsedSpikes.length > 0) {
          setSpikes(parsedSpikes);
        }
      } else {
        localStorage.setItem(STORAGE_KEY_SPIKES, JSON.stringify(INITIAL_SPIKES));
      }
    } catch (e) {
      console.warn('localStorage load error:', e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save records to localStorage whenever updated after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.warn('localStorage save records error:', e);
    }
  }, [records, hydrated]);

  // Save spikes to localStorage whenever updated after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY_SPIKES, JSON.stringify(spikes));
    } catch (e) {
      console.warn('localStorage save spikes error:', e);
    }
  }, [spikes, hydrated]);

  // Reset scroll to top on tab switch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [activeTab]);

  const handleSaveRecord = (newRecord: MatchRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddSpike = (newSpike: SpikeGear) => {
    setSpikes((prev) => [...prev, newSpike]);
  };

  const handleDeleteSpike = (spikeId: string) => {
    setSpikes((prev) => prev.filter((s) => s.id !== spikeId));
  };

  const handleResetDemoData = () => {
    setRecords(INITIAL_RECORDS);
    setSpikes(INITIAL_SPIKES);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(INITIAL_RECORDS));
    localStorage.setItem(STORAGE_KEY_SPIKES, JSON.stringify(INITIAL_SPIKES));
  };

  const summary = calculateDashboardStats(records);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16 md:pb-0">
      {/* Top Bar following the strict 3-zone contract */}
      <header className="sticky top-0 z-30 h-12 sm:h-14 flex items-center justify-between gap-8 px-4 sm:px-8 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/90">
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

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            ＋ 試合・練習を記録
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main id="top" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Compact Hero & Tab Switcher Banner */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="text-xs font-medium text-emerald-400">
                U-12 JUNIOR SOCCER REFLECTION &amp; GROWTH TRACKER
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
            PitchLog — ジュニアサッカー振り返り＆成長トラッカー（ブラウザ自動保存対応）
          </div>
          <button
            type="button"
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>初期サンプルデータを復元</span>
          </button>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (<= 15% total sticky budget with header) */}
      <nav
        aria-label="モバイルタブナビゲーション"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-3 items-center"
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
    </div>
  );
}
