'use client';

import * as React from 'react';
import {cn} from '@/lib/utils';

type Cell = {i: number; j: number; value: number | null};

export function HeatmapGrid({
  scales,
  cells,
  label = 'D',
}: {
  scales: number[];
  cells: Cell[];
  label?: string;
}) {
  const lookup = new Map<string, number | null>();
  for (const c of cells) lookup.set(`${c.i}-${c.j}`, c.value);

  const max = Math.max(
    ...cells.map((c) => (c.value !== null ? c.value : -Infinity)),
    -Infinity,
  );
  const min = 0;

  const color = (v: number | null) => {
    if (v === null) return 'transparent';
    const t = (v - min) / (max - min || 1);
    // Warm ramp: light cream → rust.
    if (t < 0.25) return `hsl(38 36% ${92 - (1 - t) * 6}%)`;
    if (t < 0.5) return `hsl(30 38% ${82 - (1 - t) * 10}%)`;
    if (t < 0.75) return `hsl(22 50% ${60 - (1 - t) * 10}%)`;
    return `hsl(18 60% ${42 - (1 - t) * 6}%)`;
  };

  const textColor = (v: number | null) => {
    if (v === null) return 'var(--color-muted-foreground)';
    const t = (v - min) / (max - min || 1);
    return t > 0.55 ? 'hsl(40 40% 98%)' : 'var(--color-foreground)';
  };

  return (
    <div
      role="img"
      aria-label={`Heatmap of KS distance across ${scales.length}×${scales.length} scale pairs`}
      className="flex flex-col gap-3"
    >
      <div
        className="grid gap-1"
        style={{gridTemplateColumns: `auto repeat(${scales.length}, 1fr)`}}
      >
        <div />
        {scales.map((s, j) => (
          <div
            key={`h-${j}`}
            className="text-center font-mono text-xs text-muted-foreground"
          >
            a={s}
          </div>
        ))}
        {scales.map((_s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center justify-end pr-2 font-mono text-xs text-muted-foreground">
              a={scales[i]}
            </div>
            {scales.map((_t, j) => {
              const v: number | null = lookup.get(`${i}-${j}`) ?? null;
              return (
                <div
                  key={`${i}-${j}`}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded font-mono text-xs font-semibold tabular-nums',
                  )}
                  style={{background: color(v), color: textColor(v)}}
                  title={`D = ${v === null ? '—' : v.toFixed(3)}`}
                >
                  {v === null ? '—' : v.toFixed(2)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        <div
          className="h-2 w-40 rounded"
          style={{
            backgroundImage:
              'linear-gradient(90deg, hsl(38 36% 92%), hsl(30 38% 82%), hsl(22 50% 60%), hsl(18 60% 42%))',
          }}
        />
        <span className="font-mono tabular-nums">
          {min.toFixed(2)} → {max.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
