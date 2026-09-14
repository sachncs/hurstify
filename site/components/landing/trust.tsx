import * as React from 'react';
import Link from 'next/link';
import {ArrowUpRight, Quote} from 'lucide-react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';

export function Trust() {
  return (
    <section
      aria-labelledby="trust-title"
      className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr),minmax(0,1.2fr)] lg:gap-16">
        <Reveal as="div" className="flex flex-col gap-4">
          <span className="eyebrow">A note on provenance</span>
          <h2
            id="trust-title"
            className="display-serif text-balance text-3xl sm:text-4xl"
          >
            {siteCopy.trust.title}
          </h2>
        </Reveal>

        <Reveal delay={140} as="div" className="flex flex-col gap-6">
          <Quote
            aria-hidden="true"
            className="h-6 w-6 text-primary/50"
          />
          <p className="text-pretty text-base leading-relaxed text-foreground/80 sm:text-lg">
            {siteCopy.trust.body}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">
                {siteCopy.trust.citationTitle}
              </span>
              <span className="fineprint">
                Open access · Replicated in this implementation
              </span>
            </div>
            <Link
              href="https://arxiv.org/abs/2509.20015v3"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
            >
              Read the paper
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
