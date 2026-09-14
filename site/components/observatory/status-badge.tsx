import * as React from 'react';
import {cn} from '@/lib/utils';
import {Badge, type BadgeProps} from '@/components/ui/badge';

type StatusTone = 'neutral' | 'live' | 'success' | 'warning' | 'destructive';

const toneMap: Record<StatusTone, BadgeProps['variant']> = {
  neutral: 'muted',
  live: 'outline',
  success: 'outline',
  warning: 'outline',
  destructive: 'destructive',
};

const dotClass: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground/60',
  live: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

const ringClass: Record<StatusTone, string> = {
  neutral: 'border-border text-muted-foreground',
  live: 'border-primary/40 text-primary',
  success: 'border-success/40 text-success',
  warning: 'border-warning/40 text-warning',
  destructive: 'border-destructive/40 text-destructive',
};

export function StatusBadge({
  label,
  tone = 'neutral',
  pulse = false,
  className,
}: {
  label: string;
  tone?: StatusTone;
  pulse?: boolean;
  className?: string;
}) {
  if (tone === 'neutral') {
    return (
      <Badge variant="muted" className={cn('gap-1.5', className)}>
        {label}
      </Badge>
    );
  }
  return (
    <Badge
      variant={toneMap[tone]}
      className={cn(
        'gap-1.5 rounded-full border bg-background/60 px-2.5 text-[11px] font-medium',
        ringClass[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full',
          dotClass[tone],
          pulse && 'animate-pulse',
        )}
      />
      {label}
    </Badge>
  );
}
