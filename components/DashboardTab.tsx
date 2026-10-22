'use client';

import React, { useState } from 'react';
import {
  Search,
  Target,
  Award,
  TrendingUp,
  Video,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Edit3,
  Save,
  Sparkles,
  Loader2,
  BatteryLow,
  Frown,
  Meh,
  Smile,
  Zap,
} from 'lucide-react';
import {
  AIAnalysisResult,
  MatchRecord,
  MatchType,
  SpikeGear,
  calculateDashboardStats,
  filterRecords,
} from '@/lib/soccer-tracker';
import { analyzeMatchReflection } from '@/lib/gemini-client';
import RadarChart from './RadarChart';
import YoutubeTimestampPlayer from './YoutubeTimestampPlayer';

interface DashboardTabProps {
  records: MatchRecord[];
  spikes: SpikeGear[];
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (updated: MatchRecord) => void;
  onNavigateToNewRecord: () => void;
}

const FILTER_TABS: Array<{ label: string; value: MatchType | 'ALL' }> = [
  { label: 'すべて', value: 'ALL' },
  { label: '公式戦', value: '公式戦' },
  { label: '練習試合', value: '練習試合' },
  { label: '練習', value: '練習' },
];

const MATCH_TYPES: MatchType[] = ['公式戦', '練習試合', '練習'];

const CONDITION_LEVELS = [
  { value: 1, label: '1: 疲労大', icon: BatteryLow },
  { value: 2, label: '2: 重い', icon: Frown },
  { value: 3, label: '3: 普通', icon: Meh },
  { value: 4, label: '4: 好調', icon: Smile },
  { value: 5, label: '5: 絶好調', icon: Zap },
];

export default function DashboardTab({
  records,
  spikes,
  onDeleteRecord,
  onUpdateRecord,
  onNavigateToNewRecord,
}: DashboardTabProps) {
  const [typeFilter, setTypeFilter] = useState<MatchType | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  // Edit State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editDate, setEditDate] = useState<string>('');
  const [editType, setEditType] = useState<MatchType>('公式戦');
  const [editOpponent, setEditOpponent] = useState<string>('');
  const [editMinutes, setEditMinutes] = useState<number>(40);
  const [editCondition, setEditCondition] = useState<number>(4);
  const [editSpikeId, setEditSpikeId] = useState<string>('');
  const [editGoodPlays, setEditGoodPlays] = useState<string>('');
  const [editChallenges, setEditChallenges] = useState<string>('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState<string>('');
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [editAiAnalysis, setEditAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [editSaveMsg, setEditSaveMsg] = useState<string>('');

  const stats = calculateDashboardStats(records);
  const filteredRecords = filterRecords(records, typeFilter, keyword);
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  const getSpikeLabel = (spikeId: string) => {
    const found = spikes.find((s) => s.id === spikeId);
    return found ? `${found.brand} ${found.modelName}` : '未設定';
  };

  const startEditing = (record: MatchRecord) => {
    setSelectedRecordId(record.id);
    setEditDate(record.date);
    setEditType(record.type);
    setEditOpponent(record.opponent);
    setEditMinutes(record.minutesPlayed);
    setEditCondition(record.condition);
    setEditSpikeId(record.spikeId || spikes[0]?.id || '');
    setEditGoodPlays(record.goodPlays);
    setEditChallenges(record.challenges);
    setEditYoutubeUrl(record.youtubeUrl || '');
    setEditAiAnalysis(record.aiAnalysis);
    setEditSaveMsg('');
    setIsEditing(true);
  };

  const handleReanalyze = async () => {
    if (!editGoodPlays.trim() && !editChallenges.trim()) {
      alert('「良かったプレー」または「課題」を入力してください。');
      return;
    }
    setIsReanalyzing(true);
    try {
      const selectedSpike = spikes.find((s) => s.id === editSpikeId);
      const { analysis } = await analyzeMatchReflection({
        date: editDate,
        type: editType,
        opponent: editOpponent,
        minutesPlayed: Number(editMinutes) || 40,
        condition: Number(editCondition) || 4,
        spikeName: selectedSpike ? `${selectedSpike.brand} ${selectedSpike.modelName}` : '',
        goodPlays: editGoodPlays,
        challenges: editChallenges,
      });
      setEditAiAnalysis(analysis);
      setEditSaveMsg('AI分析を再実行しました！保存ボタンを押して確定してください。');
      setTimeout(() => setEditSaveMsg(''), 4000);
    } catch (e) {
      console.warn('Reanalysis error:', e);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleSaveEdit = () => {
    if (!selectedRecord) return;
    const updated: MatchRecord = {
      ...selectedRecord,
      date: editDate,
      type: editType,
      opponent: editOpponent.trim() || '対戦相手',
      minutesPlayed: Number(editMinutes) || 40,
      condition: Number(editCondition) || 4,
      spikeId: editSpikeId,
      goodPlays: editGoodPlays,
      challenges: editChallenges,
      youtubeUrl: editYoutubeUrl.trim(),
      aiAnalysis: editAiAnalysis || selectedRecord.aiAnalysis,
    };
    onUpdateRecord(updated);
    setEditSaveMsg('変更内容を保存しました！');
    setTimeout(() => {
      setIsEditing(false);
      setEditSaveMsg('');
    }, 600);
  };

  // Chronological records (oldest to newest, up to last 8) for the progression chart
  const chronological = [...records]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(-8);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Top KPI Summary Strip */}
      <section
        aria-label="成長サマリー指標"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">累計振り返り記録数</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-100">
              {stats.totalMatches}
            </span>
            <span className="text-xs text-slate-400">件</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            公式戦 {stats.officialMatchCount} · 練習試合 {stats.practiceMatchCount} · 練習 {stats.trainingCount}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">累計出場・プレー時間</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-400">
              {stats.totalMinutes}
            </span>
            <span className="text-xs text-slate-400">分</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            約 {(stats.totalMinutes / 60).toFixed(1)} 時間分の実戦経験
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">4軸総合平均スコア</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-sky-400">
              {stats.overallAverageScore.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono tabular-nums">
            技 {stats.averageScores.technical.toFixed(1)} · 戦 {stats.averageScores.tactical.toFixed(1)} · 体 {stats.averageScores.physical.toFixed(1)} · 心 {stats.averageScores.mental.toFixed(1)}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">動画リンク付き記録</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-indigo-400">
                {records.filter((r) => r.youtubeUrl).length}
              </span>
              <span className="text-xs text-slate-400">件</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToNewRecord}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新しい振り返りを追加</span>
          </button>
        </div>
      </section>

      {/* Visual Analytics Hub: Overall Radar & Progression Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Overall 4-Axis Profile Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                累計4軸バランスプロファイル
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                全記録の平均スコアをレーダーチャートで可視化
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              全{stats.totalMatches}件集計
            </div>
          </div>

          <div className="py-2">
            <RadarChart scores={stats.averageScores} size={230} />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-emerald-400">💡 専属コーチ分析インサイト: </span>
            {stats.averageScores.technical >= 3.8
              ? 'ボールコントロールやパス等の技術面が強みです。次はプレッシャー下での首振りと視野の確保（戦術面）を意識するとさらに伸びます。'
              : '基礎技術の反復と丁寧なファーストタッチを習慣づけ、得意なプレーの再現性を高めていきましょう。'}
          </div>
        </div>

        {/* Recent Progression Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  直近の成長スコア推移（最新8試合）
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  1試合ごとの4軸評価の推移
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> 技
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> 戦
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 体
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> 心
                </span>
              </div>
            </div>

            {chronological.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                記録が登録されると、ここに推移グラフが表示されます。
              </div>
            ) : (
              <div className="space-y-3">
                {chronological.map((rec) => {
                  const s = rec.aiAnalysis.scores;
                  const avg = ((s.technical + s.tactical + s.physical + s.mental) / 4).toFixed(1);
                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        setSelectedRecordId(rec.id);
                        setIsEditing(false);
                      }}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 font-medium truncate">
                          <span className="font-mono text-slate-400 shrink-0">{rec.date}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                            {rec.type}
                          </span>
                          <span className="text-slate-200 truncate">{rec.opponent}</span>
                        </div>
                        <div className="font-mono tabular-nums text-slate-300 shrink-0">
                          {rec.minutesPlayed}分 / 平均 <strong className="text-emerald-400">{avg}</strong>
                        </div>
                      </div>

                      {/* 4 horizontal mini bars */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: '技', val: s.technical, color: 'bg-emerald-500' },
                          { label: '戦', val: s.tactical, color: 'bg-sky-500' },
                          { label: '体', val: s.physical, color: 'bg-teal-400' },
                          { label: '心', val: s.mental, color: 'bg-blue-500' },
                        ].map((bar) => (
                          <div key={bar.label} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
                              <span>{bar.label}</span>
                              <span className="text-slate-200">{bar.val}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${bar.color} rounded-full`}
                                style={{ width: `${(bar.val / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Bar & Records List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          {/* Interactive Segmented Control */}
          <div
            role="group"
            aria-label="種別フィルター"
            className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto"
          >
            {FILTER_TABS.map((tab) => {
              const active = typeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setTypeFilter(tab.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="対戦相手、メモの言葉、タイトル等で検索..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Record Cards */}
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">
              条件に一致する振り返り記録が見つかりませんでした
            </p>
            <p className="text-xs text-slate-500">
              検索ワードを変更するか、新しい試合・練習を記録してください
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRecords.map((rec) => {
              const s = rec.aiAnalysis.scores;
              const avgScore = ((s.technical + s.tactical + s.physical + s.mental) / 4).toFixed(1);
              return (
                <article
                  key={rec.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 p-5 transition-all shadow-sm space-y-4"
                >
                  {/* Top metadata strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono tabular-nums text-slate-200 font-semibold text-sm">
                        {rec.date}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {rec.type}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-200 font-medium">
                        {rec.opponent}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-400 font-mono tabular-nums">
                        {rec.minutesPlayed}分出場
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>👟 {getSpikeLabel(rec.spikeId)}</span>
                      {rec.youtubeUrl && (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-[11px]">
                          <Video className="w-3 h-3" />
                          <span>動画あり</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    <div className="lg:col-span-8 space-y-2">
                      <h3 className="text-base font-bold text-slate-100 hover:text-emerald-400 transition-colors">
                        {rec.aiAnalysis.summary_title}
                      </h3>

                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                        <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          <span>次へのアクション目標:</span>
                        </div>
                        <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                          {rec.aiAnalysis.coaching_feedback.next_action}
                        </p>
                      </div>
                    </div>

                    {/* Scores & Detail Action Buttons */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[11px] mr-1">4軸:</span>
                        <span>
                          技 <strong className="text-emerald-400">{s.technical}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-700">/</span>
                        <span>
                          戦 <strong className="text-sky-400">{s.tactical}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-700">/</span>
                        <span>
                          体 <strong className="text-teal-400">{s.physical}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-700">/</span>
                        <span>
                          心 <strong className="text-blue-400">{s.mental}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(rec)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          title="この記録を編集する"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>編集</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRecordId(rec.id);
                            setIsEditing(false);
                          }}
                          className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>詳細を見る</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Record Detail & Edit Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-detail-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono tabular-nums text-slate-200 font-semibold">
                    {selectedRecord.date}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400 font-semibold">
                    {selectedRecord.type}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    出場 {selectedRecord.minutesPlayed}分
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{getSpikeLabel(selectedRecord.spikeId)}</span>
                </div>
                <h2
                  id="record-detail-modal-title"
                  className="text-lg sm:text-xl font-bold text-slate-100"
                >
                  {isEditing ? '振り返り記録の編集・修正' : selectedRecord.aiAnalysis.summary_title}
                </h2>
                <p className="text-xs text-slate-400">
                  対戦相手 / メニュー: {selectedRecord.opponent}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => startEditing(selectedRecord)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>編集する</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    閲覧に戻る
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecordId(null);
                    setIsEditing(false);
                  }}
                  aria-label="詳細モーダルを閉じる"
                  className="min-h-[36px] min-w-[36px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Either Edit Form OR View Details */}
            {isEditing ? (
              /* Inline Edit Mode */
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      日付
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>

                  {/* Match Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      種別
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as MatchType)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"
                    >
                      {MATCH_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minutes Played */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      出場時間 (分)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={300}
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Opponent & Spike */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      対戦相手 / 練習テーマ
                    </label>
                    <input
                      type="text"
                      value={editOpponent}
                      onChange={(e) => setEditOpponent(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      使用スパイク
                    </label>
                    <select
                      value={editSpikeId}
                      onChange={(e) => setEditSpikeId(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"
                    >
                      {spikes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.brand} — {s.modelName} ({s.sizeCm}cm)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <span className="block text-xs font-medium text-slate-300 mb-1.5">
                    コンディション (5段階)
                  </span>
                  <div className="grid grid-cols-5 gap-1 sm:gap-2">
                    {CONDITION_LEVELS.map((lvl) => {
                      const Icon = lvl.icon;
                      const active = editCondition === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setEditCondition(lvl.value)}
                          className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-xs transition ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-[10px] sm:text-xs">{lvl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Reflection Memos */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      良かったプレー・できたこと
                    </label>
                    <textarea
                      rows={3}
                      value={editGoodPlays}
                      onChange={(e) => setEditGoodPlays(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-sky-400 mb-1">
                      課題・悔しかったこと
                    </label>
                    <textarea
                      rows={3}
                      value={editChallenges}
                      onChange={(e) => setEditChallenges(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    YouTube動画URL
                  </label>
                  <input
                    type="url"
                    value={editYoutubeUrl}
                    onChange={(e) => setEditYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100"
                  />
                </div>

                {/* AI Re-analysis trigger */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>メモ修正後のAIコーチ再分析</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      修正したメモに基づいて、AIコーチの評価スコアとアドバイスを再生成します
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReanalyze}
                    disabled={isReanalyzing}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                  >
                    {isReanalyzing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>AI分析中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI再分析を実行</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Save message */}
                {editSaveMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                    {editSaveMsg}
                  </div>
                )}

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>変更内容を保存する</span>
                  </button>
                </div>
              </div>
            ) : (
              /* View Details Mode */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Player Reflection & Radar */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <RadarChart
                        scores={selectedRecord.aiAnalysis.scores}
                        compareScores={stats.averageScores}
                        size={210}
                      />
                      <p className="text-[11px] text-center text-slate-400 mt-2">
                        緑の実線＝今回のスコア / 水色の点線＝あなたの全体平均
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-emerald-400 mb-1">
                          良かったプレーメモ
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {selectedRecord.goodPlays || '（記録なし）'}
                        </p>
                      </div>
                      <div className="border-t border-slate-800/80 pt-3">
                        <div className="text-xs font-semibold text-sky-400 mb-1">
                          課題・悔しかったことメモ
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {selectedRecord.challenges || '（記録なし）'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: AI 4 Pillars & Coaching Feedback */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                        <Target className="w-4 h-4" />
                        <span>次の練習・試合で意識する「たった1つの具体的アクション目標」</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                        {selectedRecord.aiAnalysis.coaching_feedback.next_action}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <Award className="w-4 h-4" />
                          <span>良かった点への称賛</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedRecord.aiAnalysis.coaching_feedback.praise}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>課題への改善アプローチ</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {selectedRecord.aiAnalysis.coaching_feedback.improvement}
                        </p>
                      </div>
                    </div>

                    {/* 4 Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'technical' as const, label: '技術 (Technical)', color: 'text-emerald-400' },
                        { key: 'tactical' as const, label: '戦術 (Tactical)', color: 'text-sky-400' },
                        { key: 'physical' as const, label: 'フィジカル (Physical)', color: 'text-teal-400' },
                        { key: 'mental' as const, label: 'メンタル (Mental)', color: 'text-blue-400' },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${item.color}`}>{item.label}</span>
                            <span className="font-mono tabular-nums text-slate-300">
                              {selectedRecord.aiAnalysis.scores[item.key]}/5
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedRecord.aiAnalysis.four_pillars[item.key]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Video & Timestamps Review */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-200">
                    YouTube動画＆タイムスタンプ再生
                  </h3>
                  <YoutubeTimestampPlayer
                    youtubeUrl={selectedRecord.youtubeUrl}
                    timestamps={selectedRecord.timestamps}
                    readOnly
                  />
                </div>

                {/* Modal Footer (View Mode) */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('この振り返り記録を削除してもよろしいですか？')) {
                        onDeleteRecord(selectedRecord.id);
                        setSelectedRecordId(null);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>この記録を削除</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(selectedRecord)}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>編集する</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRecordId(null)}
                      className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-colors"
                    >
                      閉じる
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
