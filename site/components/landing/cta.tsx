'use client';

import * as React from 'react';
import Link from 'next/link';
import {ArrowRight, Copy, Check} from 'lucide-react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';
import {cn} from '@/lib/utils';

export function Cta() {
  const [copied, setCopied] = React.useState(false);

  const copyInstall = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(siteCopy.cta.install);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable; fall through silently.
    }
  }, []);

  return (
    <section
      id={SECTION_IDS.cta}
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden"
    >
      <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card p-8 shadow-pop sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 paper-grain opacity-80"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-0 h-[260px] w-[400px] rounded-full bg-warning/12 blur-[100px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col gap-5">
              <span className="eyebrow">{siteCopy.cta.eyebrow}</span>
              <h2
                id="cta-title"
                className="display-serif text-balance text-4xl text-foreground sm:text-5xl lg:text-6xl"
              >
                {siteCopy.cta.title}
              </h2>
              <p className="max-w-md text-pretty text-base text-foreground/75 sm:text-lg">
                {siteCopy.cta.body}
              </p>

              <div className="mt-2 flex flex-wrap gap-3">
                <Link
                  href="/observatory"
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-pop transition-opacity hover:opacity-90',
                  )}
                >
                  {siteCopy.cta.observatoryCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href="https://arxiv.org/abs/2509.20015v3"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-background/60 px-5 text-sm font-medium text-foreground backdrop-blur-md transition-colors hover:bg-accent"
                >
                  {siteCopy.cta.docsCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-[hsl(24_14%_8%)] shadow-pop">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                    ~ terminal
                  </span>
                  <button
                    type="button"
                    onClick={copyInstall}
                    className="rounded-md border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60 transition-colors hover:bg-white/10"
                    aria-label="Copy install command"
                  >
                    {copied ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        copied
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Copy className="h-3 w-3" aria-hidden="true" />
                        copy
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3 px-5 py-7 font-mono text-sm">
                  <span className="text-primary">$</span>
                  <code className="text-foreground">{siteCopy.cta.install}</code>
                </div>
                <div className="border-t border-white/10 px-5 py-4 font-mono text-[11px] text-white/55">
                  <p>
                    <span className="text-success">+</span> hurstify@2.1.0
                  </p>
                  <p>
                    <span className="text-white/40">
                      added 1 package in 0.4s · 0 dependencies
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {[
                  {label: 'Receptive', value: '12 ms'},
                  {label: 'Bundle', value: '< 12 kb'},
                  {label: 'License', value: 'MIT'},
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/60 bg-background/40 px-3 py-3"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="font-mono text-sm text-foreground">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
