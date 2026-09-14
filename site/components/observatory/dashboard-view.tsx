'use client';

import * as React from 'react';
import {toast} from 'sonner';
import {Play, RotateCcw, Sparkles} from 'lucide-react';
import {AppShell} from '@/components/observatory/app-shell';
import {PageHeader} from '@/components/observatory/page-header';
import {SectionCard} from '@/components/observatory/section-card';
import {StatTile} from '@/components/observatory/stat-tile';
import {StatusBadge} from '@/components/observatory/status-badge';
import {EmptyChart} from '@/components/observatory/empty-chart';
import {EmptyState} from '@/components/observatory/empty-state';
import {
  ReliabilityBadge,
  deriveReliability,
} from '@/components/observatory/reliability-badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Slider} from '@/components/ui/slider';
import {Progress} from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {Separator} from '@/components/ui/separator';
import {PathChart} from '@/components/observatory/charts/path-chart';
import {HTrajChart} from '@/components/observatory/charts/h-traj-chart';
import {DiagnosticsTable} from '@/components/observatory/diagnostics-table';
import {useWorker} from '@/components/observatory/worker-client';
import {
  useExperimentHistory,
  nextId,
} from '@/components/observatory/hooks/use-experiment-history';
import {fmt} from '@/lib/format';
import {copy} from '@/lib/copy';

type Diagnostics = Parameters<typeof DiagnosticsTable>[0]['diag'];

const MODELS = [
  {value: 'fBM', label: 'Fractional Brownian Motion'},
  {value: 'rBergomi', label: 'Rough Bergomi'},
  {value: 'rFSV', label: 'Rough FSV'},
  {value: 'fOU', label: 'Fractional OU'},
  {value: 'mPRE', label: 'Multifractal Pre'},
] as const;

const OPTIMIZERS = [
  {value: 'brent', label: 'Brent'},
  {value: 'nelder-mead', label: 'Nelder-Mead'},
  {value: 'annealing', label: 'Simulated Annealing'},
  {value: 'de', label: 'Differential Evolution'},
  {value: 'ags', label: 'Adaptive Grid Search'},
] as const;

type Model = (typeof MODELS)[number]['value'];
type Optimizer = (typeof OPTIMIZERS)[number]['value'];

type Status = 'idle' | 'generating' | 'estimating' | 'complete' | 'error';

const STATUS_TONE: Record<
  Status,
  'neutral' | 'live' | 'success' | 'warning' | 'destructive'
> = {
  idle: 'neutral',
  generating: 'live',
  estimating: 'live',
  complete: 'success',
  error: 'destructive',
};

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <PageHeader
          eyebrow={copy.brand.productLine}
          title={copy.estimator.title}
          subtitle={copy.estimator.subtitle}
          meta={
            <>
              <StatusBadge label="Library v1.0" tone="neutral" />
              <StatusBadge label="Single window" tone="neutral" />
            </>
          }
        />
        <DashboardView />
      </div>
    </AppShell>
  );
}

export const metadata = {
  title: 'Real-Time Estimation',
  description:
    'Live Hurst-parameter estimation with animated trajectory and diagnostic readouts.',
};

function DashboardView() {
  const worker = useWorker();
  const {record} = useExperimentHistory();

  const [model, setModel] = React.useState<Model>('fBM');
  const [trueH, setTrueH] = React.useState(0.1);
  const [nSteps, setNSteps] = React.useState(2000);
  const [windowSize, setWindowSize] = React.useState(500);
  const [sampleSize, setSampleSize] = React.useState(500);
  const [iterations, setIterations] = React.useState(16);
  const [optimizer, setOptimizer] = React.useState<Optimizer>('brent');
  const [path, setPath] = React.useState<number[]>([]);
  const [rolling, setRolling] = React.useState<Array<{t: number; H: number}>>(
    [],
  );
  const [diag, setDiag] = React.useState<Diagnostics>(null);
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<Status>('idle');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [runtimeMs, setRuntimeMs] = React.useState<number | null>(null);

  const reset = React.useCallback(() => {
    setPath([]);
    setRolling([]);
    setDiag(null);
    setProgress(0);
    setStatus('idle');
    setErrorMsg('');
    setRuntimeMs(null);
  }, []);

  const runGenerate = React.useCallback(async () => {
    setStatus('generating');
    setErrorMsg('');
    const t0 = performance.now();
    try {
      const res = await worker.dispatch<{path: number[]}>({
        cmd: 'generate',
        payload: {
          model,
          nSteps,
          h: trueH,
          seed: Math.floor(Math.random() * 1e9),
        },
      });
      setPath(res.path);
      setRolling([]);
      setDiag(null);
      setStatus('complete');
      setRuntimeMs(Math.round(performance.now() - t0));
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      toast.error(`Path generation failed: ${msg}`);
    }
  }, [worker, model, nSteps, trueH]);

  const runEstimation = React.useCallback(async () => {
    if (path.length === 0) return;
    setStatus('estimating');
    setProgress(0);
    setErrorMsg('');
    const t0 = performance.now();
    const step = Math.max(1, Math.floor(windowSize / 8));
    try {
      const config = {
        scaleA1: 1,
        scaleA2: 25,
        sampleSize,
        iterations,
        optimizerType: optimizer,
      };
      const {results} = await worker.dispatch<{
        results: Array<{t: number; H: number}>;
      }>(
        {
          cmd: 'rolling',
          payload: {path, windowSize, step, config},
        },
        setProgress,
      );
      setRolling(results);
      setStatus('complete');
      setRuntimeMs(Math.round(performance.now() - t0));

      const valid = results.filter((r) => Number.isFinite(r.H));
      if (valid.length > 0) {
        const last = valid[valid.length - 1];
        const slice = path.slice(last.t, last.t + windowSize);
        if (slice.length === windowSize) {
          const d = await worker.dispatch<
            Parameters<typeof DiagnosticsTable>[0]['diag']
          >({cmd: 'single', payload: {path: slice, config}});
          setDiag(d);

          const meanH = valid.reduce((a, b) => a + b.H, 0) / valid.length;
          const rmse = Math.sqrt(
            valid.reduce((a, b) => a + (b.H - trueH) ** 2, 0) / valid.length,
          );
          record({
            kind: 'estimate',
            id: nextId(),
            at: Date.now(),
            model,
            trueH,
            H: meanH,
            bias: meanH - trueH,
            rmse,
            significant:
              d &&
              d.significance &&
              typeof d.significance.significant === 'boolean'
                ? d.significance.significant
                : null,
          });
        }
      }
    } catch (err) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      toast.error(`Estimation failed: ${msg}`);
    } finally {
      setProgress(1);
    }
  }, [
    worker,
    path,
    windowSize,
    sampleSize,
    iterations,
    optimizer,
    trueH,
    model,
    record,
  ]);

  React.useEffect(() => {
    runGenerate();
    // runGenerate is the only effect target — generate once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = React.useMemo(() => {
    const valid = rolling.filter((r) => Number.isFinite(r.H));
    if (valid.length === 0)
      return {avg: null, bias: null, rmse: null, std: null};
    const avg = valid.reduce((a, b) => a + b.H, 0) / valid.length;
    return {
      avg,
      bias: avg - trueH,
      rmse: Math.sqrt(
        valid.reduce((a, b) => a + (b.H - trueH) ** 2, 0) / valid.length,
      ),
      std: Math.sqrt(
        valid.reduce((a, b) => a + (b.H - avg) ** 2, 0) / valid.length,
      ),
    };
  }, [rolling, trueH]);

  const ciWidth =
    diag?.ci?.lower !== undefined && diag?.ci?.upper !== undefined
      ? diag.ci.upper - diag.ci.lower
      : null;

  const reliability =
    metrics.bias !== null && diag?.significance?.significant !== undefined
      ? deriveReliability({
          significant: diag.significance.significant,
          bias: metrics.bias,
        })
      : null;

  return (
    <div className="flex flex-col gap-10">
      <SectionCard
        eyebrow="Setup"
        title="Configure the experiment"
        description="Pick a model, true Hurst, and estimator settings, then run the pipeline."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runGenerate}
              disabled={status === 'generating' || status === 'estimating'}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {copy.estimator.actions.generate}
            </Button>
            <Button
              size="sm"
              onClick={runEstimation}
              disabled={!path.length || status === 'estimating'}
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {copy.estimator.actions.run}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {copy.estimator.actions.reset}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="dashboard-model">Model</Label>
            <Select value={model} onValueChange={(v) => setModel(v as Model)}>
              <SelectTrigger id="dashboard-model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dashboard-optimizer">Optimizer</Label>
            <Select
              value={optimizer}
              onValueChange={(v) => setOptimizer(v as Optimizer)}
            >
              <SelectTrigger id="dashboard-optimizer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPTIMIZERS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="dashboard-h-slider">True H</Label>
              <span className="font-mono text-sm tabular-nums text-primary">
                {trueH.toFixed(2)}
              </span>
            </div>
            <Slider
              id="dashboard-h-slider"
              aria-label="True Hurst parameter"
              min={0.01}
              max={0.49}
              step={0.01}
              value={[trueH]}
              onValueChange={(v) => setTrueH(v[0])}
              className="mt-3"
            />
            <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>0.01 · smooth-ish</span>
              <span>rough</span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advanced" className="border-border">
            <AccordionTrigger className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:no-underline">
              Advanced (path length · window · sample size · iterations)
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-path-length">Path length</Label>
                  <Input
                    id="dashboard-path-length"
                    aria-label="Path length"
                    type="number"
                    min={500}
                    max={10000}
                    step={100}
                    value={nSteps}
                    onChange={(e) => setNSteps(parseInt(e.target.value, 10))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-window-size">Window size</Label>
                  <Input
                    id="dashboard-window-size"
                    aria-label="Sliding window size"
                    type="number"
                    min={100}
                    max={5000}
                    step={50}
                    value={windowSize}
                    onChange={(e) =>
                      setWindowSize(parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-sample-size">Sample size</Label>
                  <Input
                    id="dashboard-sample-size"
                    aria-label="Sample size"
                    type="number"
                    min={50}
                    max={2000}
                    step={50}
                    value={sampleSize}
                    onChange={(e) =>
                      setSampleSize(parseInt(e.target.value, 10))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-iterations">Iterations</Label>
                  <Input
                    id="dashboard-iterations"
                    aria-label="Variance-reduction iterations"
                    type="number"
                    min={1}
                    max={64}
                    step={1}
                    value={iterations}
                    onChange={(e) =>
                      setIterations(parseInt(e.target.value, 10))
                    }
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <StatusBadge
            label={
              status === 'error'
                ? `Error: ${errorMsg}`
                : status.charAt(0).toUpperCase() + status.slice(1)
            }
            tone={STATUS_TONE[status]}
            pulse={status === 'generating' || status === 'estimating'}
          />
          {runtimeMs !== null ? (
            <StatusBadge label={`Runtime · ${runtimeMs} ms`} tone="neutral" />
          ) : null}
          {reliability ? <ReliabilityBadge reliability={reliability} /> : null}
        </div>

        {progress > 0 && progress < 1 ? (
          <Progress value={progress * 100} className="mt-4" />
        ) : null}
      </SectionCard>

      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <h2 className="typography-serif text-lg tracking-tight">
            Live diagnostics
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {path.length.toLocaleString()} samples
          </span>
        </header>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={copy.metrics.meanH}
            value={fmt(metrics.avg, 3)}
            tone="primary"
            emphasis
          />
          <StatTile
            label={copy.metrics.bias}
            value={fmt(metrics.bias, 4)}
            tone={
              metrics.bias === null
                ? 'muted'
                : Math.abs(metrics.bias) > 0.05
                  ? 'destructive'
                  : 'success'
            }
          />
          <StatTile
            label={copy.metrics.rmse}
            value={fmt(metrics.rmse, 4)}
            tone={
              metrics.rmse === null
                ? 'muted'
                : metrics.rmse > 0.1
                  ? 'destructive'
                  : 'muted'
            }
          />
          <StatTile
            label={copy.metrics.ciWidth}
            value={ciWidth === null ? '—' : fmt(ciWidth, 4)}
            tone="muted"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="Path"
          title="Synthetic path"
          description="Realization of the configured rough-volatility model."
          surface="default"
        >
          <EmptyChart
            ready={path.length > 0}
            emptyTitle={copy.estimator.emptyPathTitle}
            emptyDescription={copy.estimator.emptyPathDescription}
          >
            <PathChart path={path} />
          </EmptyChart>
        </SectionCard>

        <SectionCard
          eyebrow="Trajectory"
          title="H trajectory"
          description="Rolling-window estimate across the generated path."
        >
          <EmptyChart
            ready={rolling.length > 0}
            emptyTitle={copy.estimator.emptyRollingTitle}
            emptyDescription={copy.estimator.emptyRollingDescription}
          >
            <HTrajChart rolling={rolling} trueH={trueH} />
          </EmptyChart>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Diagnostics"
        title="Last window diagnostics"
        description="Single-window estimate on the last slice of the trajectory."
      >
        {diag ? (
          <DiagnosticsTable diag={diag} />
        ) : (
          <EmptyState
            title={copy.estimator.emptyRollingTitle}
            description={copy.estimator.emptyRollingDescription}
          />
        )}
      </SectionCard>
    </div>
  );
}
