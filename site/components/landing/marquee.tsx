'use client';

import * as React from 'react';
import {siteCopy} from '@/lib/site-copy';

/**
 * Subtle, infinite-horizontal "marquee" of product attributes. Doubled so
 * the loop seam is invisible. Animation pauses for accessibility if the
 * user prefers reduced motion.
 */
export function Marquee({className}: {className?: string}) {
  const items = [...siteCopy.marquee, ...siteCopy.marquee];
  return (
    <section
      aria-label="Product attributes"
      className={
        'border-y border-border/60 bg-background/60 py-6 backdrop-blur-sm ' +
        (className ?? '')
      }
    >
      <div
        className="relative mx-auto flex w-full max-w-7xl items-center overflow-hidden px-5 sm:px-8 lg:px-10"
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex shrink-0 marquee-track gap-12 whitespace-nowrap will-change-transform">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span className="inline-block h-1 w-1 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
