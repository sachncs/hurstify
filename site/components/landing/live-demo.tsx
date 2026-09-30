'use client';

import * as React from 'react';
import {
  Hurstify,
  generateFractionalBrownianMotion,
  setRandomSeed,
} from 'hurstify';
import {AlertCircle, Copy, RotateCcw} from 'lucide-react';
import {SECTION_IDS} from '@/components/landing/site-shell';

type Result = {
  H: number;
  minimizedD: number;
  elapsed: number;
  sampleCount: number;
  trueH?: number;
};
const presets = [
  {label: 'Rough', h: 0.1},
  {label: 'Brownian', h: 0.5},
  {label: 'Persistent', h: 0.8},
];
function pathPoints(values: ArrayLike<number>) {
  const width = 760;
  const height = 250;
  const list = Array.from(values);
  const min = Math.min(...list);
  const max = Math.max(...list);
  const span = max - min || 1;
  return list
    .map(
      (value, i) =>
        `${(i / Math.max(list.length - 1, 1)) * width},${height - ((value - min) / span) * (height - 24) - 12}`,
    )
    .join(' ');
}

export function LiveDemo() {
  const [mode, setMode] = React.useState<'synthetic' | 'paste'>('synthetic');
  const [h, setH] = React.useState(0.1);
  const [count, setCount] = React.useState(1200);
  const [seed, setSeed] = React.useState(42);
  const [text, setText] = React.useState('');
  const [series, setSeries] = React.useState<ArrayLike<number>>([]);
  const [result, setResult] = React.useState<Result | null>(null);
  const [error, setError] = React.useState('');
  const [running, setRunning] = React.useState(false);
  const [advanced, setAdvanced] = React.useState(false);
  const [iterations, setIterations] = React.useState(8);
  const [sampleSize, setSampleSize] = React.useState(400);
  const run = React.useCallback(
    (nextH = h) => {
      setRunning(true);
      setError('');
      window.setTimeout(() => {
        try {
          const values =
            mode === 'synthetic'
              ? (() => {
                  setRandomSeed(seed);
                  return generateFractionalBrownianMotion(count, nextH);
                })()
              : text
                  .split(/[\s,]+/)
                  .filter(Boolean)
                  .map(Number);
          if (values.length < 100)
            throw new Error(
              'Use at least 100 numeric observations for a stable estimate.',
            );
          if (values.some((value) => !Number.isFinite(value)))
            throw new Error('Every pasted value must be a finite number.');
          const started = performance.now();
          const estimator = new Hurstify({
            scaleA1: 1,
            scaleA2: 25,
            sampleSize: Math.min(sampleSize, values.length - 25),
            iterations,
          });
          const diagnostics = estimator.estimateSingleWithDiagnostics(
            Array.from(values),
          );
          setSeries(values);
          setResult({
            H: diagnostics.H,
            minimizedD: diagnostics.minimizedD,
            elapsed: performance.now() - started,
            sampleCount: values.length,
            trueH: mode === 'synthetic' ? nextH : undefined,
          });
        } catch (reason) {
          setResult(null);
          setError(
            reason instanceof Error ? reason.message : 'Estimation failed.',
          );
        } finally {
          setRunning(false);
        }
      }, 0);
    },
    [count, h, iterations, mode, sampleSize, seed, text],
  );
  React.useEffect(() => {
    run(0.1); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);
  const interpretation = result
    ? result.H < 0.43
      ? 'anti-persistent / rougher'
      : result.H > 0.57
        ? 'persistent / smoother'
        : 'Brownian-like'
    : 'Waiting for an estimate';
  const code = `import { Hurstify, generateFractionalBrownianMotion } from 'hurstify';\n\nconst path = generateFractionalBrownianMotion(2000, 0.1);\nconst result = new Hurstify({ sampleSize: 500, iterations: 16 })\n  .estimateSingleWithDiagnostics(path);\nconsole.log(result.H);`;
  return (
    <section
      id={SECTION_IDS.demo}
      aria-labelledby="demo-title"
      className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Interactive playground</p>
          <h2
            id="demo-title"
            className="display-serif mt-2 text-4xl sm:text-5xl"
          >
            Try the estimator now.
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          A real browser call to Hurstify. Generate a known path or paste your
          own time series.
        </p>
      </div>
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-pop lg:grid-cols-[280px_1fr]">
        <div className="space-y-6 border-b border-border p-5 lg:border-b-0 lg:border-r sm:p-6">
          <div className="grid grid-cols-2 rounded-lg border border-border p-1 text-sm">
            <button
              className={`rounded-md px-3 py-2 ${mode === 'synthetic' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMode('synthetic')}
            >
              Synthetic
            </button>
            <button
              className={`rounded-md px-3 py-2 ${mode === 'paste' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMode('paste')}
            >
              Paste data
            </button>
          </div>
          {mode === 'synthetic' ? (
            <>
              <div>
                <label
                  htmlFor="true-h"
                  className="mb-2 flex justify-between text-sm"
                >
                  <span>True H</span>
                  <output className="font-mono text-primary">
                    {h.toFixed(2)}
                  </output>
                </label>
                <input
                  id="true-h"
                  type="range"
                  min="0.05"
                  max="0.95"
                  step="0.01"
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label htmlFor="sample-count" className="mb-2 block text-sm">
                  Sample count
                </label>
                <input
                  id="sample-count"
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="seed" className="mb-2 block text-sm">
                  Seed
                </label>
                <input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                  className="field"
                />
              </div>
              <div>
                <p className="mb-2 text-xs text-muted-foreground">Presets</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setH(preset.h);
                        run(preset.h);
                      }}
                      className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary"
                    >
                      {preset.label}{' '}
                      <span className="font-mono">{preset.h.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="paste-data" className="mb-2 block text-sm">
                Numbers, separated by commas, spaces, or new lines
              </label>
              <textarea
                id="paste-data"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="0.12, 0.09, 0.14, …"
                className="field min-h-40 resize-y font-mono text-xs"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Minimum 100 finite observations.
              </p>
            </div>
          )}
          <details
            open={advanced}
            onToggle={(e) => setAdvanced(e.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm font-medium">
              Advanced settings
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="iterations"
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  Iterations
                </label>
                <input
                  id="iterations"
                  type="number"
                  min="1"
                  max="32"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="field"
                />
              </div>
              <div>
                <label
                  htmlFor="sample-size"
                  className="mb-1 block text-xs text-muted-foreground"
                >
                  Sample size
                </label>
                <input
                  id="sample-size"
                  type="number"
                  min="100"
                  max="1000"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(Number(e.target.value))}
                  className="field"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIterations(8);
                  setSampleSize(400);
                }}
                className="text-xs text-primary"
              >
                Reset defaults
              </button>
            </div>
          </details>
          <button
            type="button"
            onClick={() => run()}
            disabled={running}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            <RotateCcw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Estimating…' : 'Generate & estimate'}
          </button>
        </div>
        <div className="min-w-0 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="eyebrow">{running ? 'Calculating' : 'Result'}</p>
              <p
                className="mt-1 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {running
                  ? 'Running the RK-SAVR estimator…'
                  : result
                    ? `${result.sampleCount.toLocaleString()} observations · ${result.elapsed.toFixed(0)} ms`
                    : 'Run an estimate to see diagnostics.'}
              </p>
            </div>
            {result ? (
              <div className="text-right">
                <div className="font-mono text-5xl tracking-tight text-primary">
                  {result.H.toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Ĥ · {interpretation}
                </div>
              </div>
            ) : null}
          </div>
          <div className="chart-grid relative overflow-hidden rounded-xl border border-border bg-background">
            <svg
              viewBox="0 0 760 250"
              className="block h-auto min-h-[220px] w-full"
              role="img"
              aria-label="Time series chart"
            >
              <line
                x1="0"
                y1="125"
                x2="760"
                y2="125"
                stroke="currentColor"
                opacity=".12"
                strokeDasharray="4 6"
              />
              {series.length ? (
                <polyline
                  points={pathPoints(series)}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              ) : null}
            </svg>
            {!series.length && !running ? (
              <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                Your generated path will appear here.
              </p>
            ) : null}
          </div>
          {error ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}
          {result?.trueH !== undefined ? (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="metric">
                <span>True H</span>
                <strong>{result.trueH.toFixed(2)}</strong>
              </div>
              <div className="metric">
                <span>Estimated Ĥ</span>
                <strong>{result.H.toFixed(3)}</strong>
              </div>
              <div className="metric">
                <span>Absolute error</span>
                <strong>{Math.abs(result.H - result.trueH).toFixed(3)}</strong>
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              KS distance ·{' '}
              <span className="font-mono">
                {result ? result.minimizedD.toFixed(4) : '—'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(code)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy example
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
