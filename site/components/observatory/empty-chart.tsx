import * as React from 'react';
import {cn} from '@/lib/utils';
import {ChartSkeleton} from './chart-skeleton';
import {EmptyState} from './empty-state';

export function EmptyChart({
  ready,
  height = 320,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  className,
}: {
  ready: boolean;
  height?: number;
  emptyTitle: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  if (!ready) {
    return (
      <div className={cn('w-full', className)}>
        <ChartSkeleton height={height} />
      </div>
    );
  }
  return (
    <div className={cn('flex w-full flex-col gap-3', className)}>
      {children}
    </div>
  );
}

export function EmptyChartPlaceholder({
  title,
  description,
  action,
  height = 320,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  height?: number;
}) {
  return (
    <div style={{minHeight: height}}>
      <EmptyState
        title={title}
        description={description}
        action={action}
        className="h-full"
      />
    </div>
  );
}
