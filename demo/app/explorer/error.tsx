'use client';

import * as React from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export default function ExplorerError({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Explorer route error:', error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center">
      <h2 className="font-serif text-3xl">Explorer failed to render</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message ||
          'An unexpected error occurred while running the explorer.'}
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
