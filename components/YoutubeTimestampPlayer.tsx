'use client';

import React, { useState } from 'react';
import { Play, Plus, Trash2, Video } from 'lucide-react';
import {
  TimestampTag,
  VideoTimestamp,
  buildYoutubeEmbedUrl,
  extractYoutubeVideoId,
  formatSecondsToTimestamp,
  parseTimestampToSeconds,
} from '@/lib/soccer-tracker';

interface YoutubeTimestampPlayerProps {
  youtubeUrl: string;
  onYoutubeUrlChange?: (url: string) => void;
  timestamps: VideoTimestamp[];
  onTimestampsChange?: (timestamps: VideoTimestamp[]) => void;
  readOnly?: boolean;
}

const TAG_OPTIONS: TimestampTag[] = ['Good', '課題', '戦術', 'フィジカル'];

const TAG_TEXT_COLOR: Record<TimestampTag, string> = {
  Good: 'text-emerald-400',
  課題: 'text-amber-400',
  戦術: 'text-sky-400',
  フィジカル: 'text-indigo-400',
};

export default function YoutubeTimestampPlayer({
  youtubeUrl,
  onYoutubeUrlChange,
  timestamps,
  onTimestampsChange,
  readOnly = false,
}: YoutubeTimestampPlayerProps) {
  const [activeStartSeconds, setActiveStartSeconds] = useState<number>(0);
  const [autoplay, setAutoplay] = useState<boolean>(false);
  const [timeInput, setTimeInput] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<TimestampTag>('Good');
  const [memoInput, setMemoInput] = useState<string>('');
  const [timeError, setTimeError] = useState<string>('');

  const videoId = extractYoutubeVideoId(youtubeUrl);
  const embedUrl = buildYoutubeEmbedUrl(youtubeUrl, activeStartSeconds, autoplay);

  const handleJumpToTime = (seconds: number) => {
    setActiveStartSeconds(seconds);
    setAutoplay(true);
  };

  const handleAddTimestamp = () => {
    if (!onTimestampsChange) return;
    setTimeError('');

    const parsedSec = parseTimestampToSeconds(timeInput);
    if (parsedSec === null) {
      setTimeError('時間は「12:34」や「04:15」の形式（分:秒）で入力してください。');
      return;
    }
    if (!memoInput.trim()) {
      setTimeError('プレーのひとことメモを入力してください。');
      return;
    }

    const newTs: VideoTimestamp = {
      id: `ts-${Date.now()}`,
      timeStr: formatSecondsToTimestamp(parsedSec),
      seconds: parsedSec,
      tag: selectedTag,
      memo: memoInput.trim(),
    };

    const updated = [...timestamps, newTs].sort((a, b) => a.seconds - b.seconds);
    onTimestampsChange(updated);
    setTimeInput('');
    setMemoInput('');
  };

  const handleDeleteTimestamp = (id: string) => {
    if (!onTimestampsChange) return;
    onTimestampsChange(timestamps.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-4">
      {!readOnly && onYoutubeUrlChange && (
        <div>
          <label
            htmlFor="youtube-url-input"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            YouTube動画URL（限定公開リンク・通常リンク対応）
          </label>
          <div className="flex gap-2">
            <input
              id="youtube-url-input"
              type="url"
              value={youtubeUrl}
              onChange={(e) => {
                onYoutubeUrlChange(e.target.value);
                setActiveStartSeconds(0);
                setAutoplay(false);
              }}
              placeholder="例: https://www.youtube.com/watch?v=aqz-KE-bpKQ"
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            { !youtubeUrl && (
              <button
                type="button"
                onClick={() => onYoutubeUrlChange('https://www.youtube.com/watch?v=aqz-KE-bpKQ')}
                className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl whitespace-nowrap shrink-0 transition-colors"
              >
                サンプル動画を入れる
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Player */}
      {videoId && embedUrl ? (
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <iframe
              key={`${videoId}-${activeStartSeconds}-${autoplay ? 1 : 0}`}
              src={embedUrl}
              title="YouTube 試合動画プレイヤー"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              現在の再生位置指定:{' '}
              <strong className="font-mono tabular-nums text-emerald-400">
                {formatSecondsToTimestamp(activeStartSeconds)}
              </strong>
            </span>
            <span>タイムスタンプをクリックすると該当秒数へジャンプします</span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-6 text-center">
          <Video className="w-7 h-7 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-300 font-medium">
            {readOnly
              ? 'この記録にはYouTube動画リンクが登録されていません'
              : 'YouTubeのURLを入力すると、ここに動画プレイヤーが表示されます'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            試合の限定公開URLを貼り付けて、気になるプレーの秒数をメモできます
          </p>
        </div>
      )}

      {/* Timestamp Adder (Edit Mode Only) */}
      {!readOnly && onTimestampsChange && (
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
          <div className="text-xs font-semibold text-slate-200">
            タイムスタンプ＆プレーメモを追加
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-3">
              <label htmlFor="ts-time-input" className="sr-only">
                時間 (分:秒)
              </label>
              <input
                id="ts-time-input"
                type="text"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                placeholder="時間 (例 12:34)"
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm font-mono tabular-nums text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="ts-tag-select" className="sr-only">
                タグ
              </label>
              <select
                id="ts-tag-select"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value as TimestampTag)}
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="ts-memo-input" className="sr-only">
                ひとことメモ
              </label>
              <input
                id="ts-memo-input"
                type="text"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTimestamp();
                  }
                }}
                placeholder="ひとことメモ (例: 裏への抜け出し)"
                className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddTimestamp}
                className="w-full h-full min-h-[40px] px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>追加</span>
              </button>
            </div>
          </div>

          {timeError && <p className="text-xs text-rose-400">{timeError}</p>}
        </div>
      )}

      {/* Timestamps List */}
      {timestamps.length > 0 ? (
        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/40">
          {timestamps.map((ts) => (
            <div
              key={ts.id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-slate-900/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleJumpToTime(ts.seconds)}
                  aria-label={`${ts.timeStr} へジャンプして再生`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 font-mono tabular-nums text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{ts.timeStr}</span>
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-semibold ${TAG_TEXT_COLOR[ts.tag]}`}>
                      {ts.tag}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">
                      ·
                    </span>
                    <span className="text-slate-200 truncate">{ts.memo}</span>
                  </div>
                </div>
              </div>

              {!readOnly && onTimestampsChange && (
                <button
                  type="button"
                  onClick={() => handleDeleteTimestamp(ts.id)}
                  aria-label={`${ts.timeStr} のタイムスタンプを削除`}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          登録されているタイムスタンプはまだありません。
        </p>
      )}
    </div>
  );
}
