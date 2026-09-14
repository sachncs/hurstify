import Link from 'next/link';
import {ArrowRight} from 'lucide-react';

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-5 px-6 pt-24 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-primary/10 via-transparent to-transparent"
      />
      <span className="eyebrow">404 · Page not found</span>
      <h1 className="display-serif text-balance text-5xl sm:text-6xl">
        We can&apos;t find that page.
      </h1>
      <p className="max-w-md text-pretty text-base text-foreground/70">
        The link you followed may be broken, or the page may have been moved.
        Try one of the routes below — or come back to the front page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-pop transition-opacity hover:opacity-90"
        >
          Return home
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/observatory"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-background/60 px-5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent"
        >
          Open the observatory
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
