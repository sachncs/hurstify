import * as React from 'react';
import {ArrowUpRight} from 'lucide-react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';
import {cn} from '@/lib/utils';

const ACCENT_CLASS: Record<string, string> = {
  rust: 'from-primary/20 via-primary/10 to-transparent',
  gold: 'from-warning/20 via-warning/10 to-transparent',
  ink: 'from-foreground/15 via-foreground/5 to-transparent',
};

export function UseCases() {
  return (
    <section
      id={SECTION_IDS.useCases}
      aria-labelledby="use-cases-title"
      className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <Reveal as="div" className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="eyebrow">{siteCopy.useCases.eyebrow}</span>
        <h2
          id="use-cases-title"
          className="display-serif text-balance text-4xl sm:text-5xl lg:text-6xl"
        >
          {siteCopy.useCases.title}
        </h2>
        <p className="mx-auto max-w-2xl text-pretty text-base text-foreground/75 sm:text-lg">
          {siteCopy.useCases.body}
        </p>
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-6 md:grid-cols-3">
        {siteCopy.useCases.items.map((item, i) => (
          <Reveal
            key={item.title}
            once
            delay={i * 80}
            className={cn(
              'group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-7 transition-colors hover:border-foreground/40 shine-on-hover',
            )}
          >
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70',
                ACCENT_CLASS[item.accent ?? 'rust'],
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                {item.title}
              </h3>
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
            <p className="text-pretty text-sm leading-relaxed text-foreground/75">
              {item.body}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
