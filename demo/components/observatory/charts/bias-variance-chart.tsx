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

type Series = {
  trueH: number;
  rmseByW: number[];
  biasByW: number[];
};

export function BiasVarianceChart({
  windows,
  series,
}: {
  windows: number[];
  series: Series[];
}) {
  return (
    <div
      role="img"
      aria-label={`Bias-variance tradeoff across ${windows.length} windows`}
      className="h-[420px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart margin={{top: 8, left: 8, right: 8, bottom: 24}}>
          <CartesianGrid
            stroke="var(--color-chart-grid)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="w"
            type="number"
            domain={['auto', 'auto']}
            tick={{fontSize: 11, fill: 'var(--color-chart-axis)'}}
            tickLine={false}
            axisLine={{stroke: 'var(--color-chart-grid)'}}
            label={{
              value: 'Window size',
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
              value: 'RMSE / |Bias|',
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
            wrapperStyle={{fontSize: 10, fontFamily: 'var(--font-mono)'}}
          />
          {series.flatMap((s, i) => {
            const c = COLORS[i % COLORS.length];
            return [
              <Line
                key={`rmse-${i}`}
                name={`RMSE H=${s.trueH}`}
                data={windows.map((w, idx) => ({w, v: s.rmseByW[idx]}))}
                dataKey="v"
                type="monotone"
                stroke={c}
                strokeWidth={2}
                dot={{r: 5, fill: c, strokeWidth: 0}}
                isAnimationActive={false}
              />,
              <Line
                key={`bias-${i}`}
                name={`|Bias| H=${s.trueH}`}
                data={windows.map((w, idx) => ({w, v: s.biasByW[idx]}))}
                dataKey="v"
                type="monotone"
                stroke={c}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{r: 5, fill: c, strokeWidth: 0}}
                isAnimationActive={false}
              />,
            ];
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
