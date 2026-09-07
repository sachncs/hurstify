'use client';

import * as React from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export default function FiguresError({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Figures route error:', error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center">
      <h2 className="font-serif text-3xl">Figures failed to render</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message ||
          'An unexpected error occurred while generating the figures.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Retry</Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
