'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {ChartConfig} from '@/components/ui/chart';

const config = {
  path: {label: 'Path', color: 'var(--color-chart-series-1)'},
} satisfies ChartConfig;

export function PathChart({path}: {path: number[]}) {
  const data = path.map((y, i) => ({i, y}));
  return (
    <div
      role="img"
      aria-label={`Synthetic path with ${data.length} samples`}
      className="h-[320px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{top: 8, left: 0, right: 8, bottom: 4}}>
          <defs>
            <linearGradient id="fillPath" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-chart-series-1)"
                stopOpacity={0.18}
              />
              <stop
                offset="100%"
                stopColor="var(--color-chart-series-1)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="i"
            tick={{fontSize: 10, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
          />
          <YAxis
            tick={{fontSize: 10, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-chart-tooltip-bg)',
              border: '1px solid var(--color-chart-tooltip-border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-foreground)',
            }}
            cursor={{
              stroke: 'var(--color-chart-axis)',
              strokeDasharray: '3 3',
              strokeOpacity: 0.3,
            }}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke={config.path.color}
            strokeWidth={1.5}
            fill="url(#fillPath)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
