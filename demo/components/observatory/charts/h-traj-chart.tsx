'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function HTrajChart({
  rolling,
  trueH,
}: {
  rolling: Array<{t: number; H: number | null}>;
  trueH: number;
}) {
  const data = rolling.map((r) => ({t: r.t, H: r.H}));
  return (
    <div
      role="img"
      aria-label={`H trajectory across ${data.length} windows`}
      className="h-[320px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top: 8, left: 8, right: 8, bottom: 4}}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="t"
            tick={{fontSize: 10, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
          />
          <YAxis
            domain={[0, 0.6]}
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
            formatter={(v) => (typeof v === 'number' ? v.toFixed(4) : '')}
          />
          <ReferenceLine
            y={trueH}
            stroke="var(--color-chart-axis)"
            strokeDasharray="4 4"
            label={{
              value: `True H = ${trueH.toFixed(2)}`,
              position: 'insideTopRight',
              fill: 'var(--color-chart-axis)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
            }}
          />
          <Line
            type="monotone"
            dataKey="H"
            stroke="var(--color-chart-series-2)"
            strokeWidth={1.5}
            dot={false}
            activeDot={{r: 4, fill: 'var(--color-chart-series-2)'}}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
