import * as React from 'react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';

export function Metrics() {
  return (
    <section
      id={SECTION_IDS.metrics}
      aria-labelledby="metrics-title"
      className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <Reveal as="div" className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="eyebrow">{siteCopy.metrics.eyebrow}</span>
        <h2
          id="metrics-title"
          className="display-serif text-balance text-4xl sm:text-5xl lg:text-6xl"
        >
          {siteCopy.metrics.title}
        </h2>
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-4">
        {siteCopy.metrics.items.map((metric, i) => (
          <article
            key={metric.label}
            className="flex h-full flex-col gap-4 bg-card p-7"
            style={{['--stagger-index' as never]: i}}
          >
            <Reveal once delay={i * 70} className="flex h-full flex-col gap-3">
              <div className="flex items-baseline gap-1">
                <span className="display-serif text-5xl tracking-tight text-foreground sm:text-6xl">
                  {metric.figure}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {metric.unit}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-foreground/80">
                  {metric.label}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {metric.body}
                </p>
              </div>
            </Reveal>
          </article>
        ))}
      </div>
    </section>
  );
}
