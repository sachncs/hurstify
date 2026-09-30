import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowLeft, ExternalLink} from 'lucide-react';
import {BrandMark} from '@/components/landing/brand-mark';

export const metadata: Metadata = {
  title: 'API Reference',
  description: 'Exhaustive public API reference for Hurstify.',
};

const sections = [
  {
    title: 'Hurstify',
    items: [
      [
        'new Hurstify(config?)',
        'Create an estimator with scaleA1, scaleA2, scales, sampleSize, iterations, blockSize, optimizerType, hMin, and hMax.',
      ],
      [
        'estimateSingle(window, opts?)',
        'Return the estimated Hurst parameter for one numeric series.',
      ],
      [
        'estimateSingleWithDiagnostics(window, opts?)',
        'Return H, minimizedD, and diagnostic values for one series.',
      ],
      [
        'rolling(series, windowSize, step?, onProgress?)',
        'Estimate H across rolling windows.',
      ],
      [
        'estimateBatch(windows)',
        'Estimate a collection of windows and return per-window errors safely.',
      ],
    ],
  },
  {
    title: 'Synthetic generators',
    items: [
      [
        'generateFractionalBrownianMotion(n, h)',
        'Generate a fractional Brownian motion path.',
      ],
      ['generateFractionalNoise(n, h)', 'Generate fractional Gaussian noise.'],
      [
        'generateGaussianBatch(n)',
        'Generate a batch of standard Gaussian values.',
      ],
      [
        'generateCorrelatedGaussian(n, rho)',
        'Generate correlated Gaussian values for simulations.',
      ],
    ],
  },
  {
    title: 'Inference',
    items: [
      [
        'getAsymptoticVariance(H, n)',
        'Estimate asymptotic variance for the Hurst estimator.',
      ],
      [
        'getStandardError(H, n)',
        'Return the standard error implied by the asymptotic variance.',
      ],
      [
        'getConfidenceInterval(H, se, level?)',
        'Construct a confidence interval around H.',
      ],
      ['ksPvalue(D, n1, n2)', 'Compute a two-sample KS p-value.'],
      [
        'runKalmanFilter(observations, options?)',
        'Smooth a noisy H trajectory.',
      ],
    ],
  },
  {
    title: 'Data and preprocessing',
    items: [
      ['parseCsv(csv)', 'Parse CSV input into numeric records.'],
      [
        'extractSeries(rows, key?)',
        'Extract a numeric time series from records.',
      ],
      [
        'computeRealizedVariance(prices, interval?)',
        'Compute realized variance from price observations.',
      ],
      [
        'applyPreprocessingPipeline(series, steps)',
        'Compose supported centering, standardization, transform, and debiasing steps.',
      ],
    ],
  },
  {
    title: 'Optimizers, models, and utilities',
    items: [
      [
        'runBrent / runNelderMead / runAdaptiveGridSearch',
        'Run a supported optimizer directly.',
      ],
      [
        'RoughBergomiModel / RoughFsvModel / FractionalOuModel',
        'Simulate rough-volatility model paths.',
      ],
      [
        'setRandomSeed(seed) / resetRandomSeed()',
        'Make supported generation and estimation workflows reproducible.',
      ],
      [
        'computeKsDistance(a, b)',
        'Compute the Kolmogorov–Smirnov distance between samples.',
      ],
    ],
  },
];

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="hurstify home">
            <BrandMark size={30} withWordmark />
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Docs
          </Link>
        </div>
        <div className="grid gap-12 pb-20 pt-20 lg:grid-cols-[240px_1fr]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="eyebrow">Reference</p>
            <h1 className="display-serif mt-3 text-5xl">API</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The exhaustive public surface for Hurstify v2.1.
            </p>
            <a
              href="https://github.com/sachncs/hurstify/blob/master/lib/index.d.ts"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-sm text-primary"
            >
              View declarations <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </aside>
          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <h2 className="text-xl font-medium">{section.title}</h2>
                <div className="mt-6 divide-y divide-border">
                  {section.items.map(([name, description]) => (
                    <div
                      key={name}
                      className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(220px,.8fr)_1.2fr] sm:gap-8"
                    >
                      <code className="break-words font-mono text-sm text-primary">
                        {name}
                      </code>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <p className="text-xs leading-relaxed text-muted-foreground">
              This reference is maintained as product documentation. TypeScript
              declaration files and source remain canonical for exact overloads
              and advanced generic types.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
