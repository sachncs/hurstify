'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = [
  'var(--color-chart-series-1)',
  'var(--color-chart-series-2)',
  'var(--color-chart-series-3)',
  'var(--color-chart-series-4)',
  'var(--color-chart-series-5)',
];

export function RMSEByHChart({
  results,
}: {
  results: Array<{trueH: number; windowSize: number; rmse: number}>;
}) {
  const byWin = new Map<number, Array<{trueH: number; rmse: number}>>();
  for (const r of results) {
    if (!Number.isFinite(r.rmse)) continue;
    const arr = byWin.get(r.windowSize) ?? [];
    arr.push({trueH: r.trueH, rmse: r.rmse});
    byWin.set(r.windowSize, arr);
  }
  const windows = Array.from(byWin.keys()).sort((a, b) => a - b);
  const traces = windows.map((w, i) => ({
    windowSize: w,
    color: COLORS[i % COLORS.length],
    data: (byWin.get(w) ?? []).sort((a, b) => a.trueH - b.trueH),
  }));

  return (
    <div
      role="img"
      aria-label={`RMSE per H across ${windows.length} window sizes`}
      className="h-[360px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{top: 8, left: 8, right: 8, bottom: 24}}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="trueH"
            type="number"
            domain={['auto', 'auto']}
            tick={{fontSize: 10, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            label={{
              value: 'True H',
              position: 'insideBottom',
              offset: -8,
              fill: 'var(--color-chart-axis)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <YAxis
            type="number"
            scale="log"
            domain={['auto', 'auto']}
            tick={{fontSize: 10, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            width={48}
            label={{
              value: 'RMSE',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              fill: 'var(--color-chart-axis)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-chart-tooltip-bg)',
              border: '1px solid var(--color-chart-tooltip-border)',
              borderRadius: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--color-foreground)',
            }}
          />
          <Legend
            wrapperStyle={{fontSize: 11, fontFamily: 'var(--font-mono)'}}
          />
          {traces.map((t) => (
            <Line
              key={t.windowSize}
              data={t.data}
              type="monotone"
              dataKey="rmse"
              name={`W=${t.windowSize}`}
              stroke={t.color}
              strokeWidth={2}
              dot={{r: 4, fill: t.color, strokeWidth: 0}}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
