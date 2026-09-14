'use client';

import * as React from 'react';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {HeroVisual} from '@/components/landing/hero-visual';
import {cn} from '@/lib/utils';

const KEYWORDS = new Set([
  'import',
  'from',
  'const',
  'let',
  'new',
  'true',
  'false',
  'null',
  'undefined',
]);

function highlight(code: string): React.ReactNode[] {
  return code.split('\n').map((line, idx) => {
    const tokens: React.ReactNode[] = [];
    let i = 0;
    let key = 0;
    while (i < line.length) {
      const ch = line[i];
      if (ch === '/' && line[i + 1] === '/') {
        tokens.push(
          <span key={`c-${idx}-${key++}`} className="text-muted-foreground/70">
            {line.slice(i)}
          </span>,
        );
        i = line.length;
        break;
      }
      if (ch === ' ' || ch === '\t') {
        let j = i;
        while (j < line.length && /\s/.test(line[j] ?? '')) j++;
        tokens.push(line.slice(i, j));
        i = j;
        continue;
      }
      if (/[A-Za-z_$]/.test(ch ?? '')) {
        let j = i;
        while (j < line.length && /[A-Za-z0-9_$]/.test(line[j] ?? '')) j++;
        const word = line.slice(i, j);
        if (KEYWORDS.has(word)) {
          tokens.push(
            <span key={`k-${idx}-${key++}`} className="text-primary/90">
              {word}
            </span>,
          );
        } else if (/^[A-Z]/.test(word)) {
          tokens.push(
            <span key={`cap-${idx}-${key++}`} className="text-warning/90">
              {word}
            </span>,
          );
        } else {
          tokens.push(word);
        }
        i = j;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        const quote = ch;
        let j = i + 1;
        while (j < line.length && line[j] !== quote) {
          if (line[j] === '\\') j += 2;
          else j++;
        }
        j = Math.min(line.length, j + 1);
        tokens.push(
          <span key={`s-${idx}-${key++}`} className="text-success/90">
            {line.slice(i, j)}
          </span>,
        );
        i = j;
        continue;
      }
      if (/\d/.test(ch ?? '')) {
        let j = i;
        while (j < line.length && /[\d.]/.test(line[j] ?? '')) j++;
        tokens.push(
          <span key={`n-${idx}-${key++}`} className="text-warning/80">
            {line.slice(i, j)}
          </span>,
        );
        i = j;
        continue;
      }
      tokens.push(ch);
      i++;
    }
    return (
      <span key={`l-${idx}`} className="block">
        {tokens.length === 0 ? '\u00A0' : tokens}
      </span>
    );
  });
}

export function Showcase() {
  const codeRef = React.useRef<HTMLDivElement | null>(null);
  const [cursor, setCursor] = React.useState(0);

  React.useEffect(() => {
    const node = codeRef.current;
    if (!node) return;
    const total = node.scrollHeight;
    const raf = (t: number) => {
      const period = 4200;
      const phase = (t % period) / period;
      const offset = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      setCursor(offset);
      requestAnimationFrame(raf);
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, []);

  const lines = highlight(siteCopy.showcase.code);
  const codeHeight = typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.6, 360) : 320;

  return (
    <section
      aria-labelledby="showcase-title"
      className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),minmax(0,1.2fr)] lg:gap-16">
        <Reveal as="div" className="flex flex-col gap-5">
          <span className="eyebrow">{siteCopy.showcase.eyebrow}</span>
          <h2
            id="showcase-title"
            className="display-serif text-balance text-4xl sm:text-5xl"
          >
            {siteCopy.showcase.title}
          </h2>
          <p className="max-w-md text-pretty text-base text-foreground/75 sm:text-lg">
            {siteCopy.showcase.body}
          </p>

          <ul className="mt-4 grid grid-cols-2 gap-3">
            {siteCopy.showcase.output.map((row) => (
              <li
                key={row.label}
                className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 p-3"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {row.label}
                </span>
                <span className="font-mono text-sm text-foreground">
                  {row.value}
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  {row.hint}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={140} as="div" className="relative">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-pop">
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_62%_55%)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(34_78%_55%)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(140_38%_55%)]/70" />
              </div>
              <div className="rounded-md bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                estimator.ts
              </div>
              <div className="w-12" aria-hidden="true" />
            </div>

            <div
              className={cn(
                'relative grid grid-cols-[36px_1fr] gap-0 bg-[hsl(24_14%_8%)] text-[12.5px] leading-[1.65]',
              )}
            >
              <div className="border-r border-white/5 px-1 py-4 text-right font-mono text-[11px] text-white/30">
                {Array.from({length: lines.length}).map((_, i) => (
                  <span key={i} className="block">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
              <div
                ref={codeRef}
                className="relative overflow-hidden px-4 py-4 font-mono text-[12px] text-white/85"
                style={{minHeight: codeHeight}}
              >
                <pre className="whitespace-pre">{lines}</pre>
                <span
                  aria-hidden="true"
                  className="hero-cursor pointer-events-none absolute left-[1.6rem] top-4 inline-block h-[1.3em] w-[2px] bg-primary"
                  style={{
                    transform: `translateY(${cursor * (lines.length * 1.65)}px)`,
                    transition: 'transform 120ms linear',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-border/60 bg-background/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              run · 1 estimator · 2000 samples · K=16
            </div>
          </div>

          <div className="mt-6">
            <HeroVisual className="rounded-2xl" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
