'use client';

import React, { useState } from 'react';
import {
  Footprints,
  Plus,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  MatchRecord,
  SpikeGear,
  calculateSpikeUsage,
} from '@/lib/soccer-tracker';

interface SpikeGearTabProps {
  spikes: SpikeGear[];
  records: MatchRecord[];
  onAddSpike: (spike: SpikeGear) => void;
  onDeleteSpike: (spikeId: string) => void;
}

export default function SpikeGearTab({
  spikes,
  records,
  onAddSpike,
  onDeleteSpike,
}: SpikeGearTabProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [brand, setBrand] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [sizeCm, setSizeCm] = useState<string>('23.5');
  const [featureMemo, setFeatureMemo] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const usageMap = calculateSpikeUsage(spikes, records);

  const handleAddSpike = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!brand.trim() || !modelName.trim()) {
      setErrorMsg('メーカー名とモデル名を入力してください。');
      return;
    }

    const newSpike: SpikeGear = {
      id: `spike-${Date.now()}`,
      brand: brand.trim(),
      modelName: modelName.trim(),
      sizeCm: sizeCm.trim() || '23.5',
      featureMemo:
        featureMemo.trim() || '試合・練習兼用のマイスパイク。',
      startDate: startDate || todayStr,
    };

    onAddSpike(newSpike);
    setBrand('');
    setModelName('');
    setFeatureMemo('');
    setSuccessMsg(`「${newSpike.brand} ${newSpike.modelName}」を登録しました！`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 7 Cols: Registered Spikes & Automatic Usage Aggregation */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 text-balance">
                登録済みスパイク＆累計使用トラッカー
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                振り返り記録で選択されたスパイクの「累計使用回数」と「累計使用時間（分）」を自動集計します
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
              全 {spikes.length} 足登録
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {spikes.map((spike) => {
              const stat = usageMap[spike.id] || {
                spikeId: spike.id,
                usageCount: 0,
                totalMinutes: 0,
                lastUsedDate: null,
                statusLevel: 'optimal' as const,
                statusLabel: 'コンディション良好',
                wearPercentage: 0,
              };

              const StatusIcon =
                stat.statusLevel === 'replace'
                  ? AlertTriangle
                  : stat.statusLevel === 'maintenance'
                  ? Wrench
                  : CheckCircle2;

              const statusColor =
                stat.statusLevel === 'replace'
                  ? 'text-rose-400'
                  : stat.statusLevel === 'maintenance'
                  ? 'text-amber-400'
                  : 'text-emerald-400';

              const barColor =
                stat.statusLevel === 'replace'
                  ? 'bg-rose-500'
                  : stat.statusLevel === 'maintenance'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <article
                  key={spike.id}
                  className="rounded-2xl bg-slate-950/80 border border-slate-800 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="text-emerald-400 font-semibold">
                          {spike.brand}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          サイズ {spike.sizeCm}cm
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          使用開始 {spike.startDate}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-100">
                        {spike.modelName}
                      </h3>
                    </div>

                    {spikes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteSpike(spike.id)}
                        aria-label={`${spike.modelName} を削除`}
                        className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {spike.featureMemo}
                  </p>

                  {/* Auto-aggregated Stats Box */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90">
                    <div>
                      <div className="text-[11px] text-slate-400">累計使用回数</div>
                      <div className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-slate-100">
                        {stat.usageCount}{' '}
                        <span className="text-xs font-normal text-slate-400">回</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400">累計使用時間</div>
                      <div className="mt-1 text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400">
                        {stat.totalMinutes}{' '}
                        <span className="text-xs font-normal text-slate-400">分</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400">最終使用日</div>
                      <div className="mt-1 text-xs sm:text-sm font-semibold font-mono tabular-nums text-slate-200">
                        {stat.lastUsedDate || '未使用'}
                      </div>
                    </div>
                  </div>

                  {/* Maintenance & Replacement Guideline Gauge */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className={`flex items-center gap-1.5 font-semibold whitespace-nowrap shrink-0 ${statusColor}`}>
                        <StatusIcon className="w-4 h-4 shrink-0" />
                        <span>{stat.statusLabel}</span>
                      </div>
                      <span className="font-mono tabular-nums text-slate-400 whitespace-nowrap shrink-0">
                        摩耗目安 {stat.totalMinutes} / 1800分 ({stat.wearPercentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-300`}
                        style={{ width: `${Math.max(4, stat.wearPercentage)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      目安: 300分（約5時間）ごとにブラッシング＆保革クリームケア、1500〜1800分でスタッド摩耗・サイズアウト点検を推奨
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Add New Spike Form */}
      <div className="lg:col-span-5">
        <form
          onSubmit={handleAddSpike}
          className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 space-y-4"
        >
          <div className="border-b border-slate-800/80 pb-3.5">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Footprints className="w-5 h-5 text-emerald-400" />
              <span>新しいスパイクを登録</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              登録したスパイクは「新規記録＆AI分析」タブのプルダウンから選択できます
            </p>
          </div>

          <div>
            <label htmlFor="spike-brand" className="block text-xs font-medium text-slate-300 mb-1.5">
              メーカー名
            </label>
            <input
              id="spike-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例: MIZUNO / ASICS / NIKE / PUMA"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="spike-model" className="block text-xs font-medium text-slate-300 mb-1.5">
              モデル名
            </label>
            <input
              id="spike-model"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="例: モレリア NEO IV JAPAN"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="spike-size" className="block text-xs font-medium text-slate-300 mb-1.5">
                サイズ (cm)
              </label>
              <input
                id="spike-size"
                type="text"
                value={sizeCm}
                onChange={(e) => setSizeCm(e.target.value)}
                placeholder="例: 24.0"
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="spike-start-date" className="block text-xs font-medium text-slate-300 mb-1.5">
                使用開始日
              </label>
              <input
                id="spike-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="spike-memo" className="block text-xs font-medium text-slate-300 mb-1.5">
              特徴・グラウンド用途メモ
            </label>
            <textarea
              id="spike-memo"
              rows={3}
              value={featureMemo}
              onChange={(e) => setFeatureMemo(e.target.value)}
              placeholder="例: 人工芝・天然芝の公式戦用。軽量でスプリントしやすい。"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs text-rose-400">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p role="status" className="text-xs text-emerald-400 font-medium">
              {successMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>スパイクを登録する</span>
          </button>
        </form>
      </div>
    </div>
  );
}
