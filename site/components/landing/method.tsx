import * as React from 'react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';

export function Method() {
  return (
    <section
      id={SECTION_IDS.method}
      aria-labelledby="method-title"
      className="cinematic py-24 sm:py-32 lg:py-40"
    >
      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal as="div" className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
          <span className="eyebrow text-primary/80">
            {siteCopy.method.eyebrow}
          </span>
          <h2
            id="method-title"
            className="display-serif text-balance text-4xl sm:text-5xl lg:text-6xl"
          >
            {siteCopy.method.title}
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-base text-foreground/70 sm:text-lg">
            {siteCopy.method.body}
          </p>
        </Reveal>

        <ol className="reveal-stagger mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
          {siteCopy.method.steps.map((step, i) => (
            <li
              key={step.step}
              className="relative flex flex-col gap-4 bg-black/30 p-7 transition-colors hover:bg-black/40"
              style={{['--stagger-index' as never]: i}}
            >
              <Reveal
                once
                className="flex h-full flex-col gap-3"
                delay={i * 80}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.22em] text-primary/80">
                    step {step.step}
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40"
                  >
                    0{i + 1}/07
                  </span>
                </div>
                <h3 className="text-lg font-medium text-inherit">
                  {step.title}
                </h3>
                <p className="text-pretty text-sm leading-relaxed text-foreground/70">
                  {step.body}
                </p>
              </Reveal>
              <span
                aria-hidden="true"
                className="absolute right-5 top-5 inline-block h-2 w-2 rounded-full bg-primary/60"
              />
            </li>
          ))}
        </ol>

        <Reveal as="p" delay={140} className="mx-auto mt-12 max-w-3xl text-center text-pretty text-sm text-foreground/60">
          Bias shrinks with √n. Variance reduction dominates with K. Widening the
          scale ratio shrinks the asymptotic SE quadratically.
        </Reveal>
      </div>
    </section>
  );
}
