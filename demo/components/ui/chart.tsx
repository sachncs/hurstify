'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import {cn} from '@/lib/utils';

const THEMES = {light: '', dark: '.dark'} as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: never;
  };
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
  }
>(({id, className, children, config, ...props}, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{config}}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc'\]]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff'\]]:stroke-transparent [&_.recharts-layer]:outline-none",
          className,
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayload = {
  value?: number;
  name?: string;
  dataKey?: string;
  color?: string;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  className?: string;
};

function ChartTooltipContent(props: TooltipProps & {className?: string}) {
  const {active, payload, label, className} = props;
  const {config} = useChart();
  if (!active || !payload?.length) return null;
  return (
    <div
      className={cn(
        'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
        className,
      )}
    >
      {label !== undefined ? (
        <div className="font-medium">{String(label)}</div>
      ) : null}
      <div className="grid gap-1.5">
        {payload.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5"
          >
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{background: item.color}}
              />
              {item.name || item.dataKey}
            </span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {item.value !== undefined ? item.value.toLocaleString() : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export {ChartContainer, ChartTooltip, ChartTooltipContent, useChart};
