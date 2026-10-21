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
} from 'lucide-react';
import {
  MatchRecord,
  MatchType,
  SpikeGear,
  calculateDashboardStats,
  filterRecords,
} from '@/lib/soccer-tracker';
import RadarChart from './RadarChart';
import YoutubeTimestampPlayer from './YoutubeTimestampPlayer';

interface DashboardTabProps {
  records: MatchRecord[];
  spikes: SpikeGear[];
  onDeleteRecord: (id: string) => void;
  onNavigateToNewRecord: () => void;
}

const FILTER_TABS: Array<{ label: string; value: MatchType | 'ALL' }> = [
  { label: 'すべて', value: 'ALL' },
  { label: '公式戦', value: '公式戦' },
  { label: '練習試合', value: '練習試合' },
  { label: '練習', value: '練習' },
];

export default function DashboardTab({
  records,
  spikes,
  onDeleteRecord,
  onNavigateToNewRecord,
}: DashboardTabProps) {
  const [typeFilter, setTypeFilter] = useState<MatchType | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const stats = calculateDashboardStats(records);
  const filteredRecords = filterRecords(records, typeFilter, keyword);
  const selectedRecord = records.find((r) => r.id === selectedRecordId) || null;

  const getSpikeLabel = (spikeId: string) => {
    const found = spikes.find((s) => s.id === spikeId);
    return found ? `${found.brand} ${found.modelName}` : '未設定';
  };

  // Chronological records (oldest to newest, up to last 8) for the progression chart
  const chronological = [...records]
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(-8);

  return (
    <div className="space-y-6">
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
            技 {stats.averageScores.technical} · 戦 {stats.averageScores.tactical} · 体 {stats.averageScores.physical} · 心 {stats.averageScores.mental}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 sm:p-5">
          <div className="text-xs text-slate-400 font-medium">平均コンディション</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-100">
              {stats.averageCondition.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            試合に向けたピーキング指標
          </div>
        </div>
      </section>

      {/* Analytics Row: 4-Axis Radar & Score Progression Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-100">
              4軸平均バランス（技術・戦術・フィジカル・メンタル）
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              これまでの全記録のAIコーチ評価平均値
            </p>
          </div>
          <RadarChart scores={stats.averageScores} size={230} />
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  試合・練習ごとの4軸スコア＆出場時間推移
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  直近の記録における各能力軸の推移と比較
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span>技術(緑)</span>
                <span aria-hidden="true">·</span>
                <span>戦術(水色)</span>
                <span aria-hidden="true">·</span>
                <span>フィジカル(青緑)</span>
                <span aria-hidden="true">·</span>
                <span>メンタル(青)</span>
              </div>
            </div>

            {chronological.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-xs text-slate-500">
                記録が追加されると推移グラフが表示されます
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {chronological.map((rec) => {
                  const s = rec.aiAnalysis.scores;
                  const avg = ((s.technical + s.tactical + s.physical + s.mental) / 4).toFixed(1);
                  return (
                    <div
                      key={rec.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono tabular-nums text-slate-400 shrink-0">
                            {rec.date}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="text-emerald-400 font-medium shrink-0">
                            {rec.type}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">
                            ·
                          </span>
                          <span className="text-slate-200 font-medium truncate">
                            {rec.opponent}
                          </span>
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
              placeholder="対戦相手・プレー内容・ネクストアクションで検索..."
              aria-label="記録をキーワード検索"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Record Cards */}
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-10 text-center space-y-3">
            <p className="text-base font-semibold text-slate-200">
              条件に一致する振り返り記録がありません
            </p>
            <p className="text-xs text-slate-400">
              フィルターを変更するか、新しい試合・練習の振り返りを記録しましょう。
            </p>
            <button
              type="button"
              onClick={onNavigateToNewRecord}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新規記録を作成する</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((rec) => {
              const s = rec.aiAnalysis.scores;
              return (
                <article
                  key={rec.id}
                  className="rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 sm:p-6 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2.5 min-w-0 flex-1">
                      {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono tabular-nums text-slate-300 font-semibold">
                          {rec.date}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-400 font-semibold">
                          {rec.type}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          出場 {rec.minutesPlayed}分
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          体調 {rec.condition}/5
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300">
                          {getSpikeLabel(rec.spikeId)}
                        </span>
                        {rec.timestamps.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1 text-sky-400 font-mono tabular-nums">
                              <Video className="w-3.5 h-3.5" />
                              動画メモ {rec.timestamps.length}件
                            </span>
                          </>
                        )}
                      </div>

                      {/* Primary Title & Opponent */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                          {rec.aiAnalysis.summary_title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          対戦相手 / メニュー: <span className="text-slate-200 font-medium">{rec.opponent}</span>
                        </p>
                      </div>

                      {/* Next Action Highlight */}
                      <div className="pt-1 text-xs text-slate-300 flex items-start gap-2">
                        <Target className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-emerald-400 font-semibold mr-1.5">
                            次へのアクション目標:
                          </span>
                          <span>{rec.aiAnalysis.coaching_feedback.next_action}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: 4-axis tabular readout & Detail CTA */}
                    <div className="flex sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
                      <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-300">
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
                          onClick={() => setSelectedRecordId(rec.id)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-100 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>AIコーチ分析＆動画を見る</span>
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

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="record-detail-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-7 space-y-6 shadow-2xl">
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
                  {selectedRecord.aiAnalysis.summary_title}
                </h2>
                <p className="text-xs text-slate-400">
                  対戦相手 / メニュー: {selectedRecord.opponent}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecordId(null)}
                aria-label="詳細モーダルを閉じる"
                className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {selectedRecord.goodPlays || '（記録なし）'}
                    </p>
                  </div>
                  <div className="border-t border-slate-800/80 pt-3">
                    <div className="text-xs font-semibold text-sky-400 mb-1">
                      課題・悔しかったことメモ
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
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

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onDeleteRecord(selectedRecord.id);
                  setSelectedRecordId(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>この記録を削除</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRecordId(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
