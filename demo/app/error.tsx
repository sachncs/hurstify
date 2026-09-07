'use client';

import * as React from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('App error:', error);
  }, [error]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-12 text-center">
      <h2 className="font-serif text-4xl">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
