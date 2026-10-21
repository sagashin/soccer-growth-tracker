'use client';

import React from 'react';
import { FourPillarScores } from '@/lib/soccer-tracker';

interface RadarChartProps {
  scores: FourPillarScores;
  compareScores?: FourPillarScores;
  size?: number;
}

export default function RadarChart({
  scores,
  compareScores,
  size = 240,
}: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.66;
  const maxScore = 5;

  // 4 axes: Top (Technical), Right (Tactical), Bottom (Physical), Left (Mental)
  const axes = [
    { key: 'technical' as const, label: '技術 (Tech)', angle: -Math.PI / 2 },
    { key: 'tactical' as const, label: '戦術 (Tact)', angle: 0 },
    { key: 'physical' as const, label: 'フィジカル (Phys)', angle: Math.PI / 2 },
    { key: 'mental' as const, label: 'メンタル (Ment)', angle: Math.PI },
  ];

  const getPoint = (angle: number, value: number) => {
    const r = (Math.max(0, Math.min(maxScore, value)) / maxScore) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const buildPolygonPoints = (targetScores: FourPillarScores) =>
    axes
      .map((axis) => {
        const pt = getPoint(axis.angle, targetScores[axis.key] || 0);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`-28 -8 ${size + 56} ${size + 16}`}
        className="overflow-visible select-none max-w-full"
        role="img"
        aria-label={`4軸評価チャート: 技術 ${scores.technical}, 戦術 ${scores.tactical}, フィジカル ${scores.physical}, メンタル ${scores.mental}`}
      >
        {/* Concentric diamond grid */}
        {levels.map((lvl) => {
          const pts = axes
            .map((axis) => {
              const p = getPoint(axis.angle, lvl);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke={lvl === 5 ? 'rgba(148, 163, 184, 0.35)' : 'rgba(148, 163, 184, 0.16)'}
              strokeWidth={lvl === 5 ? 1.5 : 1}
              strokeDasharray={lvl < 5 ? '2 2' : undefined}
            />
          );
        })}

        {/* Axis lines */}
        {axes.map((axis) => {
          const end = getPoint(axis.angle, maxScore);
          return (
            <line
              key={axis.key}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeWidth={1}
            />
          );
        })}

        {/* Optional comparison polygon */}
        {compareScores && (
          <polygon
            points={buildPolygonPoints(compareScores)}
            fill="rgba(56, 189, 248, 0.12)"
            stroke="rgba(56, 189, 248, 0.7)"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        )}

        {/* Active scores polygon */}
        <polygon
          points={buildPolygonPoints(scores)}
          fill="rgba(16, 185, 129, 0.24)"
          stroke="#10b981"
          strokeWidth={2.5}
        />

        {/* Vertex points */}
        {axes.map((axis) => {
          const pt = getPoint(axis.angle, scores[axis.key] || 0);
          return (
            <circle
              key={axis.key}
              cx={pt.x}
              cy={pt.y}
              r={4.5}
              fill="#10b981"
              stroke="#020617"
              strokeWidth={2}
            />
          );
        })}

        {/* Axis labels positioned cleanly outside vertices */}
        {axes.map((axis) => {
          const basePos = getPoint(axis.angle, maxScore);
          const val = scores[axis.key];
          let x = basePos.x;
          let y = basePos.y;
          let anchor: 'middle' | 'start' | 'end' = 'middle';

          if (axis.key === 'technical') {
            y -= 18;
          } else if (axis.key === 'physical') {
            y += 18;
          } else if (axis.key === 'tactical') {
            x += 10;
            anchor = 'start';
          } else if (axis.key === 'mental') {
            x -= 10;
            anchor = 'end';
          }

          return (
            <g key={axis.key}>
              <text
                x={x}
                y={y - 6}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-slate-300 text-[11px] font-medium"
              >
                {axis.label}
              </text>
              <text
                x={x}
                y={y + 8}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-emerald-400 text-xs font-mono font-semibold"
              >
                {val}/5
              </text>
            </g>
          );
        })}
      </svg>

      {/* Progress bars summary for crisp numeric comparison */}
      <div className="w-full grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/80">
        {[
          { key: 'technical' as const, name: '技術 (Tech)', color: 'bg-emerald-500' },
          { key: 'tactical' as const, name: '戦術 (Tact)', color: 'bg-sky-500' },
          { key: 'physical' as const, name: 'フィジカル (Phys)', color: 'bg-teal-400' },
          { key: 'mental' as const, name: 'メンタル (Ment)', color: 'bg-blue-500' },
        ].map((item) => {
          const scoreVal = scores[item.key] || 0;
          const pct = Math.min(100, Math.max(0, (scoreVal / 5) * 100));
          return (
            <div key={item.key} className="space-y-1">
              <div className="flex items-center justify-between gap-1 text-xs">
                <span className="text-slate-300 font-medium whitespace-nowrap truncate">
                  {item.name}
                </span>
                <span className="font-mono tabular-nums text-slate-100 font-semibold whitespace-nowrap shrink-0">
                  {scoreVal} <span className="text-slate-500 font-normal">/ 5</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
