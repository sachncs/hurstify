'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const FiguresView = dynamic(
  () => import('@/components/observatory/figures-view').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading figures…
        </span>
      </div>
    ),
  },
);

export default function ObservatoryFiguresClient() {
  return <FiguresView />;
}
