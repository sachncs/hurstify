'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

export function OptimizerBar({
  results,
}: {
  results: Array<{optimizer: string; rmse: number}>;
}) {
  const byOpt = new Map<string, number[]>();
  for (const r of results) {
    if (!Number.isFinite(r.rmse)) continue;
    const arr = byOpt.get(r.optimizer) ?? [];
    arr.push(r.rmse);
    byOpt.set(r.optimizer, arr);
  }
  const data = Array.from(byOpt.entries()).map(([k, v]) => ({
    optimizer: k,
    rmse: v.reduce((a, b) => a + b, 0) / v.length,
  }));

  return (
    <div
      role="img"
      aria-label={`Optimizer comparison: mean RMSE across ${data.length} optimizers`}
      className="h-[360px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{top: 8, left: 8, right: 8, bottom: 24}}
          barCategoryGap="22%"
        >
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="optimizer"
            tick={{fontSize: 11, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            label={{
              value: 'Optimizer',
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
            tick={{fontSize: 11, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            width={48}
            label={{
              value: 'Mean RMSE',
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
            cursor={{fill: 'var(--color-accent)', fillOpacity: 0.4}}
          />
          <Bar dataKey="rmse" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
