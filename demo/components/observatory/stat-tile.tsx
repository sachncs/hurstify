import * as React from 'react';
import {cn} from '@/lib/utils';

type Tone = 'primary' | 'muted' | 'destructive' | 'success' | 'warning';

const toneClass: Record<Tone, string> = {
  primary: 'text-primary',
  muted: 'text-foreground',
  destructive: 'text-destructive',
  success: 'text-success',
  warning: 'text-warning',
};

const toneAccent: Record<Tone, string> = {
  primary: 'bg-primary',
  muted: 'bg-muted-foreground/40',
  destructive: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
};

export function StatTile({
  label,
  value,
  unit,
  hint,
  tone = 'muted',
  emphasis = false,
  size = 'md',
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  emphasis?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const valueSize =
    size === 'lg'
      ? 'text-3xl md:text-4xl'
      : size === 'sm'
        ? 'text-xl md:text-2xl'
        : 'text-2xl md:text-3xl';

  return (
    <div
      className={cn(
        'relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-card transition-shadow hover:shadow-pop md:p-5',
        emphasis ? 'border-primary/30 ring-1 ring-primary/10' : 'border-border',
        className,
      )}
    >
      {emphasis ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-4 top-0 h-px rounded-full',
            toneAccent[tone],
          )}
        />
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {hint ? (
          <span className="font-mono text-[10px] text-muted-foreground/80">
            {hint}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            'typography-serif font-normal tabular-nums leading-none tracking-tight',
            valueSize,
            toneClass[tone],
          )}
        >
          {value}
        </span>
        {unit ? (
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}
