'use client';

import * as React from 'react';
import {toast} from 'sonner';
import {Copy, Play, Workflow} from 'lucide-react';
import {AppShell} from '@/components/observatory/app-shell';
import {PageHeader} from '@/components/observatory/page-header';
import {SectionCard} from '@/components/observatory/section-card';
import {StatTile} from '@/components/observatory/stat-tile';
import {StatusBadge} from '@/components/observatory/status-badge';
import {EmptyChart} from '@/components/observatory/empty-chart';
import {EmptyState} from '@/components/observatory/empty-state';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {Progress} from '@/components/ui/progress';
import {Separator} from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {useWorker} from '@/components/observatory/worker-client';
import {ResultsTable} from '@/components/observatory/results-table';
import {RMSEByHChart} from '@/components/observatory/charts/rmse-by-h-chart';
import {OptimizerBar} from '@/components/observatory/charts/optimizer-bar';
import {fmt} from '@/lib/format';
import {copy} from '@/lib/copy';
import {cn} from '@/lib/utils';
import {
  useExperimentHistory,
  nextId,
} from '@/components/observatory/hooks/use-experiment-history';

type Result = Parameters<typeof ResultsTable>[0]['results'][number];

const ALL_OPTIMIZERS = [
  {id: 'brent', label: 'Brent'},
  {id: 'nelder-mead', label: 'Nelder-Mead'},
  {id: 'annealing', label: 'Annealing'},
  {id: 'de', label: 'Differential Evolution'},
  {id: 'ags', label: 'Adaptive Grid Search'},
] as const;

export default function ExplorerPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <PageHeader
          eyebrow="Sweeps"
          title={copy.explorer.title}
          subtitle={copy.explorer.subtitle}
        />
        <ExplorerView />
      </div>
    </AppShell>
  );
}

export const metadata = {
  title: 'Parameter Explorer',
  description: 'Grid search across Hurst values, window sizes, and optimizers.',
};

function ExplorerView() {
  const worker = useWorker();
  const {record} = useExperimentHistory();
  const [hStart, setHStart] = React.useState(0.05);
  const [hEnd, setHEnd] = React.useState(0.45);
  const [hStep, setHStep] = React.useState(0.05);
  const [winsText, setWinsText] = React.useState('250, 500, 1000');
  const [trials, setTrials] = React.useState(5);
  const [pathLength, setPathLength] = React.useState(1500);
  const [selectedOpts, setSelectedOpts] = React.useState<string[]>(
    ALL_OPTIMIZERS.map((o) => o.id),
  );
  const [results, setResults] = React.useState<Result[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<
    'idle' | 'running' | 'complete' | 'error'
  >('idle');

  const toggleOpt = (id: string) => {
    setSelectedOpts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const windowSizes = React.useMemo(
    () =>
      winsText
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => Number.isFinite(n)),
    [winsText],
  );

  const trueHs = React.useMemo(() => {
    const out: number[] = [];
    for (let h = hStart; h <= hEnd + 1e-9; h += hStep) {
      out.push(Math.round(h * 100) / 100);
    }
    return out;
  }, [hStart, hEnd, hStep]);

  const runGrid = async () => {
    setStatus('running');
    setProgress(0);

    try {
      const {results} = await worker.dispatch<{results: Result[]}>(
        {
          cmd: 'explorer',
          payload: {
            trueHs,
            windowSizes,
            optimizers: selectedOpts,
            nTrials: trials,
            pathLength,
            configBase: {
              scaleA1: 1,
              scaleA2: 25,
              sampleSize: 500,
              iterations: 8,
            },
          },
        },
        setProgress,
      );
      setResults(results);
      setStatus('complete');

      const valid = results.filter((r) => Number.isFinite(r.rmse));
      if (valid.length > 0) {
        const top = [...valid].sort((a, b) => a.rmse - b.rmse)[0];
        record({
          kind: 'sweep',
          id: nextId(),
          at: Date.now(),
          optimizer: top.optimizer,
          windowSize: top.windowSize,
          trueH: top.trueH,
          rmse: top.rmse,
          failRate: top.failRate,
        });
      }
    } catch (err) {
      setStatus('error');
      toast.error(
        `Grid search failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      setProgress(1);
    }
  };

  const topConfigs = React.useMemo(() => {
    const valid = results.filter((r) => Number.isFinite(r.rmse));
    return [...valid].sort((a, b) => a.rmse - b.rmse).slice(0, 3);
  }, [results]);

  const totalRuns =
    trueHs.length * windowSizes.length * selectedOpts.length * trials;

  return (
    <div className="flex flex-col gap-10">
      <SectionCard
        eyebrow="Search space"
        title={copy.explorer.searchSpace}
        description="Configure the grid and the optimizers to compare."
        actions={
          <Button
            onClick={runGrid}
            disabled={
              status === 'running' ||
              selectedOpts.length === 0 ||
              windowSizes.length === 0
            }
            size="sm"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {copy.explorer.actions.run}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3">
            <Label>H range</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Start
                </span>
                <Input
                  aria-label="H range start"
                  type="number"
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  value={hStart}
                  onChange={(e) => setHStart(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  End
                </span>
                <Input
                  aria-label="H range end"
                  type="number"
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  value={hEnd}
                  onChange={(e) => setHEnd(parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Step
                </span>
                <Input
                  aria-label="H range step"
                  type="number"
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={hStep}
                  onChange={(e) => setHStep(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-2">
            <Label htmlFor="explorer-wins">Window sizes</Label>
            <Input
              id="explorer-wins"
              aria-label="Window sizes (comma-separated)"
              placeholder="250, 500, 1000"
              value={winsText}
              onChange={(e) => setWinsText(e.target.value)}
            />
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Comma-separated integers
            </p>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="explorer-pathlen">Path length</Label>
              <Input
                id="explorer-pathlen"
                aria-label="Path length"
                type="number"
                min={500}
                max={5000}
                step={100}
                value={pathLength}
                onChange={(e) => setPathLength(parseInt(e.target.value, 10))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="explorer-trials">Trials</Label>
              <Input
                id="explorer-trials"
                aria-label="Trials per config"
                type="number"
                min={1}
                max={20}
                value={trials}
                onChange={(e) => setTrials(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="lg:col-span-12 space-y-3">
            <Label>Optimizers</Label>
            <div className="flex flex-wrap gap-2.5">
              {ALL_OPTIMIZERS.map((o) => {
                const checked = selectedOpts.includes(o.id);
                return (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs transition-colors hover:border-primary/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOpt(o.id)}
                    />
                    <span className="font-medium">{o.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              label={
                status === 'idle'
                  ? 'Ready'
                  : status.charAt(0).toUpperCase() + status.slice(1)
              }
              tone={
                status === 'running'
                  ? 'live'
                  : status === 'error'
                    ? 'destructive'
                    : status === 'complete'
                      ? 'success'
                      : 'neutral'
              }
              pulse={status === 'running'}
            />
            <span className="font-mono text-xs text-muted-foreground">
              <span className="text-foreground">{trueHs.length}</span> H ·{' '}
              <span className="text-foreground">{windowSizes.length}</span>{' '}
              windows ·{' '}
              <span className="text-foreground">{selectedOpts.length}</span>{' '}
              optimizers · <span className="text-foreground">{trials}</span>{' '}
              trials ={' '}
              <span className="text-primary">{totalRuns.toLocaleString()}</span>{' '}
              runs
            </span>
          </div>
        </div>

        {progress > 0 && progress < 1 ? (
          <Progress value={progress * 100} className="mt-4" />
        ) : null}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          eyebrow="RMSE × H"
          title="RMSE per H"
          description="Each line is a window size; lower is better."
        >
          <EmptyChart
            ready={results.length > 0}
            emptyTitle={copy.explorer.emptyTitle}
            emptyDescription={copy.explorer.emptyDescription}
          >
            <RMSEByHChart results={results} />
          </EmptyChart>
        </SectionCard>

        <SectionCard
          eyebrow="Optimizers"
          title="Optimizer comparison"
          description="Mean RMSE aggregated across the grid."
        >
          <EmptyChart
            ready={results.length > 0}
            emptyTitle={copy.explorer.emptyTitle}
            emptyDescription={copy.explorer.emptyDescription}
          >
            <OptimizerBar results={results} />
          </EmptyChart>
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Top configurations"
        title={copy.explorer.bestConfigurations}
        description="Top three configurations by RMSE."
        actions={
          topConfigs.length > 0 ? (
            <Button asChild size="sm" variant="ghost">
              <a href="#results-table">View all results</a>
            </Button>
          ) : null
        }
      >
        {topConfigs.length === 0 ? (
          <EmptyState
            icon={<Workflow className="h-4 w-4" aria-hidden="true" />}
            title={copy.explorer.emptyTitle}
            description={copy.explorer.emptyDescription}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {topConfigs.map((r, i) => (
              <div
                key={`${r.optimizer}-${r.windowSize}-${r.trueH}`}
                className="relative flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Rank #{i + 1}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Copy configuration"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          navigator.clipboard
                            ?.writeText(
                              JSON.stringify(
                                {
                                  optimizer: r.optimizer,
                                  windowSize: r.windowSize,
                                  trueH: r.trueH,
                                  rmse: r.rmse,
                                  bias: r.bias,
                                  failRate: r.failRate,
                                  avgTime: r.avgTime,
                                },
                                null,
                                2,
                              ),
                            )
                            .then(() => toast.success('Configuration copied'))
                        }
                      >
                        Copy as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <StatTile
                  size="sm"
                  label={copy.metrics.rmse}
                  value={fmt(r.rmse, 4)}
                  tone="primary"
                  emphasis={i === 0}
                />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <KV label="Optimizer" value={r.optimizer} />
                  <KV label="Window" value={r.windowSize} mono />
                  <KV label="True H" value={fmt(r.trueH, 2)} mono />
                  <KV label="Bias" value={fmt(r.bias, 4)} mono />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="All results"
        title="Results table"
        description="Per-configuration RMSE, bias, fail rate, and average runtime."
      >
        <div id="results-table">
          {results.length > 0 ? (
            <ResultsTable results={results} />
          ) : (
            <EmptyState
              icon={<Workflow className="h-4 w-4" aria-hidden="true" />}
              title={copy.explorer.emptyTitle}
              description={copy.explorer.emptyDescription}
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function KV({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          mono ? 'font-mono tabular-nums' : 'font-medium',
          'text-foreground',
        )}
      >
        {value}
      </div>
    </div>
  );
}
