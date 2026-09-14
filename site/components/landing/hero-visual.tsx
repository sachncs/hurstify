'use client';

import * as React from 'react';
import {cn} from '@/lib/utils';

/**
 * Animated inline SVG that visualizes a synthetic rough-volatility path
 * sliding under the estimator. Designed for hero use: high-contrast ink on
 * paper, ambient aurora glow, and a thin animated scan line that reads as
 * the estimator "advancing" through the window.
 */
export function HeroVisual({className}: {className?: string}) {
  // Deterministic synth: cosine-of-cumsum with a low-frequency envelope
  // to mimic a rough-volatility path. Generated at module load — small
  // enough to stay smooth in SSR.
  const viewWidth = 720;
  const viewHeight = 360;
  const N = 240;
  const paths = React.useMemo(() => {
    const rng = mulberry(20260614);
    const series: Array<{x: number; y: number}> = [];
    let x = 0;
    let acc = viewHeight / 2;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const drift = 6 * Math.sin(t * 6 * Math.PI) + 4 * Math.sin(t * 11 * Math.PI);
      const shock = (rng() - 0.5) * (12 + 18 * Math.abs(Math.sin(t * 4 * Math.PI)));
      x += shock + drift * 0.04;
      acc = viewHeight / 2 + x * 1.6;
      series.push({
        x: (i / N) * viewWidth,
        y: Math.max(20, Math.min(viewHeight - 20, acc)),
      });
    }
    return series;
  }, []);

  const linePoints = paths.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const scanX = (paths[N - 60]?.x ?? viewWidth * 0.25) + 40;
  const lastPoint = paths[paths.length - 1];

  return (
    <div
      className={cn(
        'relative isolate w-full overflow-hidden rounded-2xl border border-border/80 bg-card/40 shadow-pop',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 hero-aurora paper-grain opacity-80" />

      {/* Aurora layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 h-[260px] w-[260px] rounded-full bg-warning/20 blur-[100px]"
      />

      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="relative block h-auto w-full"
        role="img"
        aria-label="Animated rough-volatility path being scanned by the RK-SAVR estimator"
      >
        <defs>
          <linearGradient id="hero-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-warning)" />
            <stop offset="50%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0.8" />
          </linearGradient>
          <pattern id="hero-grid" width="60" height="36" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 36"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.1"
            />
          </pattern>
        </defs>

        <rect
          x="0"
          y="0"
          width={viewWidth}
          height={viewHeight}
          fill="url(#hero-grid)"
          className="text-foreground"
        />

        {/* Confidence band */}
        <path
          d={areaPath(paths, viewHeight)}
          fill="url(#hero-fill)"
          opacity="0.85"
        />

        {/* Animated scan line */}
        <line
          x1={scanX}
          x2={scanX}
          y1={0}
          y2={viewHeight}
          stroke="var(--color-foreground)"
          strokeOpacity="0.18"
          strokeDasharray="3 4"
        >
          <animate
            attributeName="x1"
            values={`${scanX - 200};${scanX + 100};${scanX - 200}`}
            dur="9s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values={`${scanX - 200};${scanX + 100};${scanX - 200}`}
            dur="9s"
            repeatCount="indefinite"
          />
        </line>

        <polyline
          points={linePoints}
          fill="none"
          stroke="url(#hero-stroke)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="hero-path"
        />

        {/* Pulsing tail marker */}
        {lastPoint ? (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="3.2"
              fill="var(--color-primary)"
              className="hero-dot"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="8"
              fill="none"
              stroke="var(--color-primary)"
              strokeOpacity="0.4"
            >
              <animate
                attributeName="r"
                values="6;14;6"
                dur="2.4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-opacity"
                values="0.5;0;0.5"
                dur="2.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ) : null}

        {/* Estimate readout (locked in the visual). */}
        <g transform="translate(28 32)">
          <rect
            width="170"
            height="76"
            rx="10"
            fill="var(--color-card)"
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x="14"
            y="22"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            letterSpacing="1.2"
            fill="var(--color-muted-foreground)"
          >
            Ĥ ESTIMATE
          </text>
          <text
            x="14"
            y="56"
            fontFamily="ui-serif, Georgia, serif"
            fontSize="28"
            fill="var(--color-foreground)"
          >
            0.107
          </text>
          <text
            x="100"
            y="56"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="11"
            fill="var(--color-muted-foreground)"
          >
            / true 0.100
          </text>
          <text
            x="14"
            y="70"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="var(--color-success)"
          >
            bias ▲ 0.018 · n=2000
          </text>
        </g>
      </svg>

      {/* Foot caption */}
      <div className="relative border-t border-border/60 bg-background/70 px-5 py-3 text-[11px] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            RK-SAVR · live
          </div>
          <div className="flex items-center gap-3">
            <span>K = 16 iter</span>
            <span aria-hidden="true">·</span>
            <span>W = 2000</span>
            <span aria-hidden="true">·</span>
            <span>a₁ = 1 · a₂ = 25</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Builds an SVG area path under a polyline closed at the bottom. */
function areaPath(points: Array<{x: number; y: number}>, h: number): string {
  if (points.length === 0) return '';
  const top = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
  return `M ${top} L ${points[points.length - 1].x.toFixed(1)},${h} L ${points[0].x.toFixed(1)},${h} Z`;
}

/** Tiny seedable PRNG so SSR + CSR agree. Mulberry32. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
