'use client';

import * as React from 'react';
import Link from 'next/link';
import {ArrowRight, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {siteCopy} from '@/lib/site-copy';
import {HeroVisual} from '@/components/landing/hero-visual';
import {Reveal} from '@/components/landing/reveal';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden"
    >
      {/* Ambient aurora background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px]"
      >
        <div className="hero-aurora absolute inset-0 paper-grain" />
        <div className="absolute left-1/2 top-[-180px] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 pb-24 pt-36 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr),minmax(0,1.05fr)] lg:items-center lg:gap-16 lg:px-10 lg:pb-32 lg:pt-44">
        <div className="flex flex-col gap-7">
          <Reveal as="div" className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur-md">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              />
              {siteCopy.hero.eyebrow}
              <span aria-hidden="true">·</span>
              <a
                href="https://arxiv.org/abs/2509.20015v3"
                target="_blank"
                rel="noreferrer"
                className="font-mono uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              >
                arXiv
              </a>
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex">
              v2.1 · September 2026
            </span>
          </Reveal>

          <Reveal as="h1" delay={120} className="display-serif text-balance text-[44px] leading-[1.02] sm:text-6xl md:text-7xl">
            <span id="hero-title" className="block text-foreground">
              {siteCopy.hero.titleA}{' '}
              <em className="text-primary">{siteCopy.hero.titleEm}</em>{' '}
              {siteCopy.hero.titleB}
            </span>
          </Reveal>

          <Reveal as="p" delay={180} className="max-w-xl text-pretty text-base text-foreground/75 sm:text-lg">
            {siteCopy.hero.subtitle}
          </Reveal>

          <Reveal
            as="div"
            delay={260}
            className="flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-6 text-sm shadow-pop"
            >
              <a
                href={siteCopy.footer.columns[1].links[0].href}
                target="_blank"
                rel="noreferrer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {siteCopy.hero.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full border border-border/80 bg-background/40 px-6 text-sm text-foreground backdrop-blur-md hover:bg-accent"
            >
              <Link href="/observatory">
                {siteCopy.hero.secondaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>

          <Reveal
            as="div"
            delay={340}
            className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 fineprint"
          >
            <span>MIT licensed</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span>Zero runtime dependencies</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span>Node 24+ · modern browsers</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span>ESM + CJS + IIFE</span>
          </Reveal>
        </div>

        <Reveal
          as="div"
          delay={260}
          distance={32}
          className="relative"
        >
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  );
}
