'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {fmt} from '@/lib/format';
import {
  ReliabilityBadge,
  deriveReliability,
} from '@/components/observatory/reliability-badge';
import {cn} from '@/lib/utils';

export function DiagnosticsTable({
  diag,
}: {
  diag: {
    minimizedD?: number;
    significance?: {pValue?: number; significant?: boolean};
    se?: number;
    ci?: {lower?: number; upper?: number};
  } | null;
}) {
  const placeholder = '—';

  const rows: Array<{
    label: string;
    value: React.ReactNode;
    emphasis?: boolean;
  }> = diag
    ? [
        {
          label: 'KS distance D',
          value: fmt(diag.minimizedD, 4),
          emphasis: true,
        },
        {
          label: 'p-value',
          value:
            diag.significance?.pValue !== undefined
              ? fmt(diag.significance.pValue, 4)
              : placeholder,
        },
        {
          label: 'Significant',
          value:
            diag.significance?.significant === true ? (
              <span className="text-success">Yes</span>
            ) : diag.significance?.significant === false ? (
              <span className="text-muted-foreground">No</span>
            ) : (
              placeholder
            ),
        },
        {
          label: 'Standard error',
          value: diag.se !== undefined ? fmt(diag.se, 4) : placeholder,
        },
        {
          label: '95% CI',
          value:
            diag.ci?.lower !== undefined && diag.ci?.upper !== undefined
              ? `[${fmt(diag.ci.lower, 3)}, ${fmt(diag.ci.upper, 3)}]`
              : placeholder,
        },
      ]
    : [];

  const reliability =
    diag?.significance?.significant !== undefined &&
    diag?.minimizedD !== undefined
      ? deriveReliability({
          significant: diag.significance.significant,
          bias: diag.minimizedD,
        })
      : null;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_240px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-44 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Metric
            </TableHead>
            <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Value
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="font-mono text-muted-foreground">
                {row.label}
              </TableCell>
              <TableCell
                className={cn(
                  'font-mono tabular-nums',
                  row.emphasis && 'text-primary',
                )}
              >
                {row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <aside className="rounded-lg border border-border bg-muted/30 p-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Reliability
        </span>
        <div className="mt-3">
          {reliability ? (
            <ReliabilityBadge reliability={reliability} />
          ) : (
            <span className="font-mono text-sm text-muted-foreground">—</span>
          )}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {reliability === 'reliable' &&
            'KS rejects at 5% and |bias| < 0.05. Estimate is trustworthy.'}
          {reliability === 'marginal' &&
            'KS rejects but |bias| is in the 0.05–0.10 band. Use with caution.'}
          {reliability === 'unreliable' &&
            'KS fails to reject, or |bias| ≥ 0.10. Treat as noise.'}
          {!reliability &&
            'Run the estimator to populate reliability from diagnostics.'}
        </p>
      </aside>
    </div>
  );
}
