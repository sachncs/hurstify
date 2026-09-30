import type {Metadata} from 'next';
import {ArrowUpRight, Check} from 'lucide-react';
import {SiteNav} from '@/components/landing/site-nav';
import {LiveDemo} from '@/components/landing/live-demo';
import {SiteFooter} from '@/components/landing/footer';
import {BrandMark} from '@/components/landing/brand-mark';
import {CodeBlock} from '@/components/landing/code-block';
import {SECTION_IDS, MAIN_CONTENT_ID} from '@/components/landing/site-shell';

export const metadata: Metadata = {
  title: 'hurstify — Hurst parameter estimation for JavaScript',
  description:
    'Estimate the Hurst parameter of rough-volatility time series in the browser or Node.js with a zero-dependency RK-SAVR implementation.',
};

const capabilities = [
  [
    'RK-SAVR estimator',
    'Multi-scale Kolmogorov–Smirnov estimation for roughness.',
  ],
  [
    'Synthetic generators',
    'Create reproducible fractional Brownian paths for experiments.',
  ],
  [
    'Statistical inference',
    'Diagnostics, confidence tools, and significance testing are available.',
  ],
  [
    'Browser + Node',
    'Pure JavaScript with ESM, CJS, IIFE, and TypeScript declarations.',
  ],
  [
    'Rolling estimation',
    'Track H across windows without leaving your JavaScript workflow.',
  ],
  [
    'Zero runtime dependencies',
    'A small, auditable implementation with no production dependency tree.',
  ],
];
const steps = [
  ['01', 'Segmentation', 'Choose a stationary window.'],
  ['02', 'Increments', 'Compare increments at two or more scales.'],
  ['03', 'Permutation', 'Reduce serial dependence with block randomization.'],
  ['04', 'Subsampling', 'Draw manageable samples at each scale.'],
  ['05', 'Rescaling', 'Apply the self-similar H scaling.'],
  ['06', 'KS minimization', 'Find H at the smallest distributional distance.'],
  ['07', 'Variance reduction', 'Repeat and average for a steadier estimate.'],
];
const quickStart = `import { Hurstify, generateFractionalBrownianMotion } from 'hurstify';\n\nconst path = generateFractionalBrownianMotion(2000, 0.1);\nconst result = new Hurstify({\n  scaleA1: 1, scaleA2: 25, sampleSize: 500, iterations: 16,\n}).estimateSingleWithDiagnostics(path);\n\nconsole.log(result.H);`;

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main id={MAIN_CONTENT_ID} tabIndex={-1}>
        <section className="hero mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 lg:px-10 lg:pb-20 lg:pt-40">
          <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <BrandMark size={36} withWordmark={false} />
                <span className="eyebrow">Zero-dependency JavaScript</span>
              </div>
              <h1 className="display-serif max-w-3xl text-balance text-5xl leading-[.98] sm:text-7xl">
                Measure the <em className="text-primary">roughness</em> of
                volatility.
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Estimate the Hurst parameter directly in Node.js or the browser
                with a production-ready implementation of RK-SAVR.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={`#${SECTION_IDS.demo}`}
                  className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                >
                  Try the live demo ↘
                </a>
                <a
                  href="https://github.com/sachncs/hurstify"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border px-5 py-3 text-sm font-medium"
                >
                  View on GitHub{' '}
                  <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span>✓ Zero runtime dependencies</span>
                <span>✓ ESM · CJS · IIFE</span>
                <span>✓ Browser + Node.js</span>
                <span>✓ TypeScript declarations</span>
              </div>
            </div>
            <div className="hero-note rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-5 flex items-center justify-between">
                <span className="eyebrow">A single parameter</span>
                <span className="font-mono text-xs text-muted-foreground">
                  0 → 1
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 w-[35%] rounded-full bg-primary" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <strong className="block font-mono text-primary">0.10</strong>
                  <span className="text-muted-foreground">rough</span>
                </div>
                <div>
                  <strong className="block font-mono">0.50</strong>
                  <span className="text-muted-foreground">Brownian</span>
                </div>
                <div>
                  <strong className="block font-mono">0.80</strong>
                  <span className="text-muted-foreground">persistent</span>
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Lower H means rougher, more anti-persistent motion. Higher H
                means smoother, more persistent motion.
              </p>
            </div>
          </div>
        </section>
        <LiveDemo />
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-8 rounded-2xl border border-border bg-secondary/40 p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:p-12">
            <div>
              <p className="eyebrow">What does H mean?</p>
              <h2 className="display-serif mt-3 text-4xl">
                One number, three useful intuitions.
              </h2>
            </div>
            <div className="space-y-6">
              <div className="relative pt-2">
                <div className="h-1 rounded-full bg-border" />
                <div className="absolute left-[10%] top-0 h-5 w-5 rounded-full border-4 border-background bg-primary" />
                <div className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-background bg-foreground" />
                <div className="absolute left-[80%] top-0 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-background bg-primary" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <p>
                  <strong className="font-mono">H ≈ 0.1</strong>
                  <br />
                  <span className="text-muted-foreground">
                    rough / anti-persistent
                  </span>
                </p>
                <p>
                  <strong className="font-mono">H ≈ 0.5</strong>
                  <br />
                  <span className="text-muted-foreground">Brownian-like</span>
                </p>
                <p>
                  <strong className="font-mono">H ≈ 0.8</strong>
                  <br />
                  <span className="text-muted-foreground">
                    smooth / persistent
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id={SECTION_IDS.quickstart}
          className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 lg:px-10"
        >
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
            <div>
              <p className="eyebrow">Quick start</p>
              <h2 className="display-serif mt-3 text-4xl">
                From data to Ĥ in one call.
              </h2>
              <p className="mt-4 text-muted-foreground">
                The demo uses the same public API you can import in your own
                app. The package is published from this repository with no
                runtime dependencies.
              </p>
              <a
                className="mt-6 inline-flex items-center gap-1 text-sm text-primary"
                href="https://github.com/sachncs/hurstify/blob/master/docs/getting-started.md"
                target="_blank"
                rel="noreferrer"
              >
                Read getting started <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <CodeBlock code={quickStart} />
          </div>
        </section>
        <section
          id={SECTION_IDS.features}
          className="border-y border-border bg-secondary/30"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
            <p className="eyebrow">Why hurstify</p>
            <h2 className="display-serif mt-3 max-w-xl text-4xl">
              A focused tool for understanding roughness.
            </h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(([title, body]) => (
                <article key={title} className="bg-card p-6">
                  <span className="mb-5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Check className="h-4 w-4" />
                  </span>
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id={SECTION_IDS.method}
          className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 lg:px-10"
        >
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="display-serif mt-3 text-4xl">
              Seven steps from increments to inference.
            </h2>
            <p className="mt-4 text-muted-foreground">
              RK-SAVR uses rescaling invariance and randomized
              Kolmogorov–Smirnov comparison to estimate H without asking the
              homepage to become a textbook.
            </p>
          </div>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, body]) => (
              <li
                key={number}
                className="rounded-xl border border-border bg-card p-5"
              >
                <span className="font-mono text-xs text-primary">{number}</span>
                <h3 className="mt-5 font-medium">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>
        <section
          id={SECTION_IDS.provenance}
          className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-20 sm:px-8 lg:px-10"
        >
          <div className="grid gap-8 rounded-2xl border border-border p-7 sm:p-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Research provenance</p>
              <h2 className="display-serif mt-3 text-4xl">
                Independent implementation. Clear lineage.
              </h2>
            </div>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p>
                Hurstify implements the RK-SAVR algorithm described by Angelini
                &amp; Bianchi (2025). It is an independent open-source
                implementation; this project does not imply endorsement by the
                paper authors.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href="https://arxiv.org/abs/2509.20015v3"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  Read the paper ↗
                </a>
                <a
                  href="https://github.com/sachncs/hurstify/tree/master/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  Read methodology ↗
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
