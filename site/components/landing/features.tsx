import * as React from 'react';
import {cn} from '@/lib/utils';
import {siteCopy} from '@/lib/site-copy';
import {Reveal} from '@/components/landing/reveal';
import {SECTION_IDS} from '@/components/landing/site-shell';

const KIND_MAP: Record<string, FeatureVisual> = {
  estimator: EstimatorArt,
  scales: ScalesArt,
  inference: InferenceArt,
  models: ModelsArt,
  optimizers: OptimizersArt,
  package: PackageArt,
};

export function Features() {
  return (
    <section
      id={SECTION_IDS.features}
      aria-labelledby="features-title"
      className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <Reveal as="div" className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <span className="eyebrow">{siteCopy.features.eyebrow}</span>
        <h2
          id="features-title"
          className="display-serif text-balance text-4xl sm:text-5xl lg:text-6xl"
        >
          {siteCopy.features.title}
        </h2>
        <p className="mx-auto max-w-2xl text-pretty text-base text-foreground/70 sm:text-lg">
          {siteCopy.features.body}
        </p>
      </Reveal>

      <div className="reveal-stagger mt-16 grid gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/40 md:grid-cols-2 lg:grid-cols-3">
        {siteCopy.features.items.map((feature, i) => {
          const Visual = KIND_MAP[feature.kind] ?? EstimatorArt;
          return (
            <article
              key={feature.title}
              className={cn(
                'group relative flex flex-col gap-5 bg-card p-7 transition-colors hover:bg-card/80 shine-on-hover',
              )}
              style={{['--stagger-index' as never]: i}}
            >
              <Reveal
                once
                className="flex h-full flex-col gap-5"
                delay={i * 70}
              >
                <div className="flex h-32 items-center justify-center rounded-xl bg-background/60 ring-1 ring-border/70">
                  <Visual />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-lg font-medium text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            </article>
          );
        })}
      </div>
    </section>
  );
}

type FeatureVisual = () => React.ReactElement;

/* ---------- inline SVG art for each feature card ---------- */

function EstimatorArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M10 90 L 70 90" strokeOpacity="0.25" />
        <path d="M10 70 L 70 70" strokeOpacity="0.25" />
        <path d="M10 50 L 70 50" strokeOpacity="0.25" />
        <path d="M70 25 L 210 25" strokeOpacity="0.7" />
        <path d="M70 95 L 210 95" strokeOpacity="0.7" />
      </g>
      <g fill="currentColor">
        <circle cx="20" cy="50" r="1.4" opacity="0.5" />
        <circle cx="35" cy="85" r="1.4" opacity="0.7" />
        <circle cx="50" cy="65" r="1.4" opacity="0.5" />
        <circle cx="60" cy="72" r="1.4" opacity="0.7" />
      </g>
      <path
        d="M70 70 Q 100 50 130 65 Q 160 80 190 55 Q 210 40 210 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M70 30 L 210 95"
        stroke="var(--color-foreground)"
        strokeOpacity="0.3"
        strokeDasharray="2 3"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function ScalesArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeLinecap="round"
      >
        <path
          d="M20 95 L 50 60 L 80 78 L 110 38 L 140 64 L 170 32 L 200 58"
          strokeWidth="1.5"
        />
        <path
          d="M20 100 L 200 100"
          strokeOpacity="0.3"
          strokeDasharray="2 4"
        />
      </g>
      <g fill="currentColor">
        <circle cx="20" cy="95" r="2" />
        <circle cx="50" cy="60" r="2" />
        <circle cx="80" cy="78" r="2" />
        <circle cx="110" cy="38" r="2" />
        <circle cx="140" cy="64" r="2" />
        <circle cx="170" cy="32" r="2" />
        <circle cx="200" cy="58" r="2" />
      </g>
    </svg>
  );
}

function InferenceArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor">
        <path
          d="M30 80 Q 60 30 90 70 Q 120 110 150 50 Q 180 0 200 40"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M30 100 L 200 100"
          strokeOpacity="0.25"
          strokeDasharray="2 4"
        />
      </g>
      <g fill="var(--color-foreground)" fontFamily="ui-monospace" fontSize="9">
        <text x="92" y="58" fill="currentColor">
          0.10
        </text>
        <text x="148" y="42" fill="currentColor">
          0.18
        </text>
      </g>
      <rect
        x="84"
        y="42"
        width="100"
        height="3"
        fill="var(--color-primary)"
        opacity="0.45"
      />
    </svg>
  );
}

function ModelsArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="models-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#models-stroke)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M10 100 L 30 70 L 50 78 L 70 40 L 90 64 L 110 28 L 130 60 L 150 22 L 170 56 L 190 30 L 210 48" />
      </g>
      <g fill="currentColor">
        <circle cx="90" cy="64" r="1.6" />
        <circle cx="150" cy="22" r="1.6" />
        <circle cx="190" cy="30" r="1.6" />
      </g>
    </svg>
  );
}

function OptimizersArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="var(--color-foreground)"
        strokeOpacity="0.18"
        strokeDasharray="2 3"
      >
        <circle cx="110" cy="60" r="38" />
        <circle cx="110" cy="60" r="20" />
      </g>
      <polyline
        points="40,80 60,68 80,72 100,52 120,60 140,38 160,52 180,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="80" r="2.4" fill="currentColor" opacity="0.4" />
      <circle cx="180" cy="40" r="2.4" fill="currentColor" />
      <circle cx="160" cy="52" r="2.4" fill="currentColor" />
    </svg>
  );
}

function PackageArt() {
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-[80%] w-[88%] text-primary"
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <rect x="40" y="30" width="140" height="60" rx="8" />
        <path d="M40 50 L 180 50" strokeOpacity="0.4" />
      </g>
      <g
        fill="none"
        stroke="var(--color-foreground)"
        strokeOpacity="0.45"
        strokeWidth="1"
      >
        <path d="M55 65 L 110 65" />
        <path d="M55 75 L 130 75" />
      </g>
      <g fill="currentColor">
        <rect x="55" y="38" width="40" height="2.4" rx="1.2" />
        <rect x="55" y="44" width="22" height="2.4" rx="1.2" opacity="0.6" />
      </g>
    </svg>
  );
}
