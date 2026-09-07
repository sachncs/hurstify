'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  ChartLine,
  Compass,
  Sparkles,
  Workflow,
} from 'lucide-react';
import {AppShell} from '@/components/observatory/app-shell';
import {PageHeader} from '@/components/observatory/page-header';
import {SectionCard} from '@/components/observatory/section-card';
import {StatTile} from '@/components/observatory/stat-tile';
import {StatusBadge} from '@/components/observatory/status-badge';
import {EmptyState} from '@/components/observatory/empty-state';
import {Button} from '@/components/ui/button';
import {Separator} from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {fmt} from '@/lib/format';
import {copy} from '@/lib/copy';
import {
  useExperimentHistory,
  type ExperimentEntry,
  nextId,
} from '@/components/observatory/hooks/use-experiment-history';

const KIND_META: Record<
  ExperimentEntry['kind'],
  {
    label: string;
    href: string;
    tone: 'neutral' | 'live' | 'success' | 'warning' | 'destructive';
  }
> = {
  estimate: {label: 'Estimate', href: '/dashboard', tone: 'live'},
  sweep: {label: 'Sweep', href: '/explorer', tone: 'success'},
  figure: {label: 'Figure', href: '/figures', tone: 'neutral'},
};

function describeEntry(entry: ExperimentEntry): string {
  switch (entry.kind) {
    case 'estimate':
      return `${entry.model} · true H = ${fmt(entry.trueH, 2)}`;
    case 'sweep':
      return `H = ${fmt(entry.trueH, 2)} · W = ${entry.windowSize} · ${entry.optimizer}`;
    case 'figure':
      return entry.figure;
  }
}

function entryResult(entry: ExperimentEntry): React.ReactNode {
  switch (entry.kind) {
    case 'estimate':
      return (
        <>
          Ĥ = <span className="font-mono text-primary">{fmt(entry.H, 3)}</span>
          {'  ·  RMSE '}
          <span className="font-mono">{fmt(entry.rmse, 4)}</span>
        </>
      );
    case 'sweep':
      return (
        <>
          RMSE{' '}
          <span className="font-mono text-primary">{fmt(entry.rmse, 4)}</span>
          {'  ·  fail '}
          <span className="font-mono">
            {(entry.failRate * 100).toFixed(1)}%
          </span>
        </>
      );
    case 'figure':
      return <span className="font-mono text-muted-foreground">viewed</span>;
  }
}

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/**
 * Renders a localized timestamp only after the client has mounted, so SSR
 * output stays deterministic and doesn't trigger a hydration mismatch
 * when the user's locale differs from the server's default locale.
 */
function ClientDate({value}: {value: number}) {
  const [text, setText] = React.useState<string | null>(null);
  React.useEffect(() => {
    setText(new Date(value).toLocaleString());
  }, [value]);
  return <span suppressHydrationWarning>{text ?? '—'}</span>;
}

export default function OverviewPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <PageHeader
          eyebrow={copy.brand.productLine}
          title={copy.overview.title}
          subtitle={copy.overview.subtitle}
          meta={
            <>
              <StatusBadge label="Library v1.0" tone="neutral" />
              <StatusBadge label="Zero dependencies" tone="neutral" />
              <StatusBadge label="Web worker isolated" tone="neutral" />
            </>
          }
        />

        <OverviewBody />
      </div>
    </AppShell>
  );
}

function OverviewBody() {
  const {entries, ready, record, clear} = useExperimentHistory();
  const lastEstimate = entries.find((e) => e.kind === 'estimate');
  const lastSweep = entries.find((e) => e.kind === 'sweep');
  const lastFigure = entries.find((e) => e.kind === 'figure');
  const seededRef = React.useRef(false);

  // Seed a synthetic demo entry after the history hook has primed itself,
  // and only if no persisted entries exist. Runs at most once per session.
  React.useEffect(() => {
    if (!ready) return;
    if (seededRef.current) return;
    if (entries.length > 0) {
      seededRef.current = true;
      return;
    }
    seededRef.current = true;
    record({
      kind: 'estimate',
      id: nextId(),
      at: Date.now(),
      model: 'fBM',
      trueH: 0.1,
      H: 0.118,
      bias: 0.018,
      rmse: 0.041,
      significant: true,
    });
  }, [ready, entries.length, record]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <header className="flex items-baseline justify-between">
          <h2 className="typography-serif text-lg tracking-tight">
            Latest activity
          </h2>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Open estimator
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SnapshotCard
            eyebrow="Estimator"
            title="Latest estimate"
            description="Most recent single-window Hurst estimate."
            href="/dashboard"
            emptyTitle="No estimates yet"
            emptyDescription="Run a path on the estimator to capture diagnostics here."
          >
            {lastEstimate && lastEstimate.kind === 'estimate' ? (
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  size="sm"
                  label="Mean Ĥ"
                  value={fmt(lastEstimate.H, 3)}
                  tone="primary"
                  emphasis
                />
                <StatTile
                  size="sm"
                  label="Bias"
                  value={fmt(lastEstimate.bias, 4)}
                  hint={`true ${fmt(lastEstimate.trueH, 2)}`}
                  tone={
                    Math.abs(lastEstimate.bias) > 0.05
                      ? 'destructive'
                      : 'success'
                  }
                />
                <StatTile
                  size="sm"
                  label="RMSE"
                  value={fmt(lastEstimate.rmse, 4)}
                  tone="muted"
                />
                <StatTile
                  size="sm"
                  label="Model"
                  value={lastEstimate.model}
                  tone="muted"
                />
              </div>
            ) : null}
          </SnapshotCard>

          <SnapshotCard
            eyebrow="Latest sweep"
            title="Grid search"
            description="Top-line RMSE from the most recent grid search."
            href="/explorer"
            emptyTitle="No recent runs"
            emptyDescription="Run a sweep in the Explorer to capture results here."
          >
            {lastSweep && lastSweep.kind === 'sweep' ? (
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  size="sm"
                  label="RMSE"
                  value={fmt(lastSweep.rmse, 4)}
                  tone="primary"
                  emphasis
                />
                <StatTile
                  size="sm"
                  label="Optimizer"
                  value={lastSweep.optimizer}
                  tone="muted"
                />
                <StatTile
                  size="sm"
                  label="Window"
                  value={lastSweep.windowSize}
                  tone="muted"
                />
                <StatTile
                  size="sm"
                  label="Fail rate"
                  value={`${(lastSweep.failRate * 100).toFixed(1)}%`}
                  tone={lastSweep.failRate > 0.1 ? 'destructive' : 'success'}
                />
              </div>
            ) : null}
          </SnapshotCard>

          <SnapshotCard
            eyebrow="Latest figure"
            title="Diagnostics"
            description="The diagnostic figure viewed most recently."
            href="/figures"
            emptyTitle="No recent runs"
            emptyDescription="Open any figure tab to bookmark it here."
          >
            {lastFigure && lastFigure.kind === 'figure' ? (
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/40 text-primary">
                    <ChartLine className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Figure
                    </span>
                    <span className="text-sm font-medium">
                      {lastFigure.figure}
                    </span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{timeAgo(lastFigure.at)}</span>
                  <ClientDate value={lastFigure.at} />
                </div>
              </div>
            ) : null}
          </SnapshotCard>
        </div>
      </section>

      <SectionCard
        eyebrow="History"
        title={copy.overview.sectionRecent}
        description="Activity from this browser, sorted by most recent."
        actions={
          entries.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          ) : null
        }
      >
        {entries.length === 0 ? (
          <EmptyState
            icon={<Activity className="h-4 w-4" aria-hidden="true" />}
            title={copy.overview.emptyTitle}
            description={copy.overview.emptyDescription}
            action={
              <Button asChild size="sm">
                <Link href="/dashboard">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {copy.overview.emptyCta}
                </Link>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Result
                </TableHead>
                <TableHead className="w-32 text-right font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  When
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.slice(0, 12).map((entry) => {
                const meta = KIND_META[entry.kind];
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Link
                        href={meta.href}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary hover:underline"
                      >
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {describeEntry(entry)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {entryResult(entry)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {timeAgo(entry.at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Runtime"
        title="System status"
        description="Live indicators for the observatory."
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatusBadge label="Worker pool: 1" tone="neutral" />
          <StatusBadge label="RNG seedable" tone="success" />
          <StatusBadge label="Estimator: ready" tone="live" pulse />
          <StatusBadge label="Sweeper: idle" tone="neutral" />
        </div>
      </SectionCard>
    </div>
  );
}

function SnapshotCard({
  eyebrow,
  title,
  description,
  href,
  emptyTitle,
  emptyDescription,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  const hasContent = React.Children.count(children) > 0;
  return (
    <SectionCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={
        <Button asChild size="sm" variant="ghost">
          <Link href={href}>
            Open
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      {hasContent ? (
        children
      ) : (
        <EmptyState
          icon={<Compass className="h-4 w-4" aria-hidden="true" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}
    </SectionCard>
  );
}

export const metadata = {
  title: 'Overview',
  description:
    'Real-time estimation, parameter sweeps, and diagnostic figures for the Hurst parameter.',
};
