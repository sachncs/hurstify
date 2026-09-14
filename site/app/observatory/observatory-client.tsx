'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const OverviewView = dynamic(
  () => import('@/components/observatory/overview-view').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading the observatory…
        </span>
      </div>
    ),
  },
);

export default function ObservatoryClient() {
  return <OverviewView />;
}
