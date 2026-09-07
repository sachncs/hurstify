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

type Result = {
  trueH: number;
  windowSize: number;
  optimizer: string;
  rmse: number;
  bias: number;
  failRate: number;
  avgTime: number;
};

export function ResultsTable({results}: {results: Result[]}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            True H
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Window
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Optimizer
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            RMSE
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Bias
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Fail rate
          </TableHead>
          <TableHead className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Avg time (ms)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-mono tabular-nums">
              {fmt(r.trueH)}
            </TableCell>
            <TableCell className="font-mono tabular-nums">
              {r.windowSize}
            </TableCell>
            <TableCell className="font-mono">{r.optimizer}</TableCell>
            <TableCell className="font-mono tabular-nums text-primary">
              {fmt(r.rmse, 4)}
            </TableCell>
            <TableCell className="font-mono tabular-nums">
              {fmt(r.bias, 4)}
            </TableCell>
            <TableCell className="font-mono tabular-nums text-muted-foreground">
              {fmt(r.failRate, 2)}
            </TableCell>
            <TableCell className="font-mono tabular-nums">
              {Math.round(r.avgTime)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
