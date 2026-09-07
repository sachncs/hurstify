'use client';

import * as React from 'react';
import {AppShell} from '@/components/observatory/app-shell';
import {PageHeader} from '@/components/observatory/page-header';
import {SectionCard} from '@/components/observatory/section-card';
import {EmptyChart} from '@/components/observatory/empty-chart';
import {StatusBadge} from '@/components/observatory/status-badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Download, RefreshCw} from 'lucide-react';
import {
  Hurstify,
  generateFractionalBrownianMotion,
  setRandomSeed,
  resetRandomSeed,
} from '../../../lib/index.js';
import {fmt} from '@/lib/format';
import {copy} from '@/lib/copy';
import {HTrajChart} from '@/components/observatory/charts/h-traj-chart';
import {HeatmapGrid} from '@/components/observatory/charts/heatmap-grid';
import {BiasVarianceChart} from '@/components/observatory/charts/bias-variance-chart';
import {
  useExperimentHistory,
  nextId,
} from '@/components/observatory/hooks/use-experiment-history';

const FIGURES = [
  {value: 'fig-ks-curve', label: 'Fig 1 · KS curve'},
  {value: 'fig-multi-scale', label: 'Fig 2 · Multi-scale'},
  {value: 'fig-rolling', label: 'Fig 3 · Rolling'},
  {value: 'fig-bias-variance', label: 'Fig 4 · Bias / variance'},
] as const;

export default function FiguresPage() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <PageHeader
          eyebrow="Diagnostics"
          title={copy.figures.title}
          subtitle={copy.figures.subtitle}
        />
        <FiguresView />
      </div>
    </AppShell>
  );
}

export const metadata = {
  title: 'Figures / Diagnostics',
  description:
    'Replicated figures from Angelini & Bianchi (2025) with configurable parameters.',
};

function FiguresView() {
  const [tab, setTab] =
    React.useState<(typeof FIGURES)[number]['value']>('fig-ks-curve');
  const {record} = useExperimentHistory();

  React.useEffect(() => {
    record({
      kind: 'figure',
      id: nextId(),
      at: Date.now(),
      figure: FIGURES.find((f) => f.value === tab)?.label ?? tab,
    });
  }, [tab, record]);

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as (typeof FIGURES)[number]['value'])}
      className="flex flex-col gap-6"
    >
      <TabsList className="flex h-auto w-fit flex-wrap gap-1">
        {FIGURES.map((f) => (
          <TabsTrigger
            key={f.value}
            value={f.value}
            className="font-mono text-[11px] uppercase tracking-[0.16em]"
          >
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="fig-ks-curve">
        <Figure1 />
      </TabsContent>
      <TabsContent value="fig-multi-scale">
        <Figure2 />
      </TabsContent>
      <TabsContent value="fig-rolling">
        <Figure3 />
      </TabsContent>
      <TabsContent value="fig-bias-variance">
        <Figure4 />
      </TabsContent>
    </Tabs>
  );
}

function FigureControls({children}: {children: React.ReactNode}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Figure1() {
  const [trueH, setTrueH] = React.useState(0.1);
  const [n, setN] = React.useState(2000);
  const [windowSize, setWindowSize] = React.useState(500);
  const [res, setRes] = React.useState(0.005);
  const [a1, setA1] = React.useState(1);
  const [a2, setA2] = React.useState(25);
  const [chartData, setChartData] = React.useState<{
    hs: number[];
    ds: number[];
    minH: number;
  } | null>(null);

  const render = React.useCallback(() => {
    setRandomSeed(42);
    const path = generateFractionalBrownianMotion(n, trueH);
    resetRandomSeed();
    const slice = Array.from(path.slice(0, windowSize));
    const inc1 = Hurstify.getIncrements(slice, a1);
    const inc2 = Hurstify.getIncrements(slice, a2);
    const s1 = Array.from(inc1).sort((a, b) => a - b);
    const s2 = Array.from(inc2).sort((a, b) => a - b);
    const hs: number[] = [];
    const ds: number[] = [];
    for (let h = 0.01; h <= 0.99; h += res) {
      const f1 = Math.pow(a1, -h);
      const f2 = Math.pow(a2, -h);
      ds.push(ksRescaled(s1, s2, f1, f2));
      hs.push(h);
    }
    const minIdx = ds.indexOf(Math.min(...ds));
    setChartData({hs, ds, minH: hs[minIdx]});
  }, [n, trueH, windowSize, a1, a2, res]);

  React.useEffect(render, [render]);

  return (
    <SectionCard
      eyebrow="Fig 1"
      title="KS distance vs H"
      description="KS objective D(H) over candidate H; lower is better."
      actions={
        <>
          <Button onClick={render} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {copy.figures.actions.rerender}
          </Button>
          <FigureExportButton targetId="fig1-chart" filename="fig-ks-curve" />
        </>
      }
    >
      <FigureControls>
        <Field label="True H" htmlFor="fig1-true-h">
          <Input
            id="fig1-true-h"
            aria-label="True Hurst parameter"
            type="number"
            min={0.01}
            max={0.99}
            step={0.01}
            value={trueH}
            onChange={(e) => setTrueH(parseFloat(e.target.value))}
          />
        </Field>
        <Field label="Path length" htmlFor="fig1-n">
          <Input
            id="fig1-n"
            aria-label="Path length"
            type="number"
            min={500}
            max={10000}
            step={100}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Window size" htmlFor="fig1-window">
          <Input
            id="fig1-window"
            aria-label="Sliding window size"
            type="number"
            min={100}
            max={5000}
            step={50}
            value={windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="H resolution" htmlFor="fig1-res">
          <Input
            id="fig1-res"
            aria-label="H resolution"
            type="number"
            min={0.001}
            max={0.05}
            step={0.001}
            value={res}
            onChange={(e) => setRes(parseFloat(e.target.value))}
          />
        </Field>
        <Field label="Scale A1" htmlFor="fig1-a1">
          <Input
            id="fig1-a1"
            aria-label="Scale A1"
            type="number"
            min={1}
            max={10}
            value={a1}
            onChange={(e) => setA1(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Scale A2" htmlFor="fig1-a2">
          <Input
            id="fig1-a2"
            aria-label="Scale A2"
            type="number"
            min={2}
            max={100}
            value={a2}
            onChange={(e) => setA2(parseInt(e.target.value, 10))}
          />
        </Field>
      </FigureControls>

      <div id="fig1-chart" className="mt-6 flex flex-col gap-3">
        <EmptyChart
          ready={chartData !== null}
          emptyTitle={copy.figures.emptyTitle}
          emptyDescription={copy.figures.emptyDescription}
          height={320}
        >
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>KS curve · D(H)</span>
            <span className="text-primary">Ĥ ≈ {fmt(chartData?.minH)}</span>
          </div>
          {chartData ? <KSCurveChart data={chartData} /> : null}
        </EmptyChart>
      </div>
    </SectionCard>
  );
}

function KSCurveChart({
  data,
}: {
  data: {hs: number[]; ds: number[]; minH: number};
}) {
  // Lightweight inline SVG so we don't add a recharts dep just for this tab.
  const w = 720;
  const h = 280;
  const pad = {top: 12, right: 16, bottom: 28, left: 36};
  const x = (v: number) =>
    pad.left +
    ((v - data.hs[0]) / (data.hs.at(-1)! - data.hs[0])) *
      (w - pad.left - pad.right);
  const yMax = Math.max(...data.ds);
  const y = (v: number) =>
    h - pad.bottom - (v / (yMax || 1)) * (h - pad.top - pad.bottom);
  const pts = data.hs.map((xv, i) => `${x(xv)},${y(data.ds[i])}`).join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-[280px] w-full"
      role="img"
      aria-label="KS distance curve"
    >
      <line
        x1={pad.left}
        y1={h - pad.bottom}
        x2={w - pad.right}
        y2={h - pad.bottom}
        stroke="var(--color-chart-axis)"
        strokeWidth={1}
      />
      <line
        x1={pad.left}
        y1={pad.top}
        x2={pad.left}
        y2={h - pad.bottom}
        stroke="var(--color-chart-axis)"
        strokeWidth={1}
      />
      <polyline
        fill="none"
        stroke="var(--color-chart-series-1)"
        strokeWidth={2}
        points={pts}
      />
      <line
        x1={x(data.minH)}
        y1={pad.top}
        x2={x(data.minH)}
        y2={h - pad.bottom}
        stroke="var(--color-chart-series-2)"
        strokeDasharray="4 4"
        strokeWidth={1}
      />
      <text
        x={w - pad.right}
        y={pad.top + 12}
        textAnchor="end"
        fontSize={11}
        fill="var(--color-chart-axis)"
        fontFamily="var(--font-mono)"
      >
        Ĥ ≈ {fmt(data.minH)}
      </text>
    </svg>
  );
}

function Figure2() {
  const [trueH, setTrueH] = React.useState(0.1);
  const [n, setN] = React.useState(2000);
  const [windowSize, setWindowSize] = React.useState(500);
  const [scalesText, setScalesText] = React.useState('1, 2, 5, 10, 20, 50');
  const [grid, setGrid] = React.useState<{
    scales: number[];
    cells: Array<{i: number; j: number; value: number | null}>;
  } | null>(null);

  const render = React.useCallback(() => {
    const scales = scalesText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((s) => !isNaN(s));
    setRandomSeed(42);
    const path = generateFractionalBrownianMotion(n, trueH);
    resetRandomSeed();
    const slice = Array.from(path.slice(0, windowSize));
    const estimator = new Hurstify({
      scales,
      sampleSize: Math.min(300, windowSize),
    });
    const raw = estimator.profile(slice, {scales});
    const cells: Array<{i: number; j: number; value: number | null}> = [];
    for (let i = 0; i < scales.length; i++) {
      for (let j = 0; j < scales.length; j++) {
        let v: number | null = null;
        if (i === j) v = 0;
        else if (j < i) {
          const fi = Math.pow(raw.scaleValues[i], -raw.H);
          const fj = Math.pow(raw.scaleValues[j], -raw.H);
          v = ksRescaled(
            Array.from(raw.sortedSamples[i]),
            Array.from(raw.sortedSamples[j]),
            fi,
            fj,
          );
        } else {
          v = null;
        }
        cells.push({i, j, value: v});
      }
    }
    setGrid({scales, cells});
  }, [n, trueH, windowSize, scalesText]);

  React.useEffect(render, [render]);

  return (
    <SectionCard
      eyebrow="Fig 2"
      title="Multi-scale profile"
      description="Pairwise KS distances across scales (lower = more similar)."
      actions={
        <>
          <Button onClick={render} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {copy.figures.actions.rerender}
          </Button>
          <FigureExportButton
            targetId="fig2-chart"
            filename="fig-multi-scale"
          />
        </>
      }
    >
      <FigureControls>
        <Field label="True H" htmlFor="fig2-true-h">
          <Input
            id="fig2-true-h"
            aria-label="True Hurst parameter"
            type="number"
            min={0.01}
            max={0.99}
            step={0.01}
            value={trueH}
            onChange={(e) => setTrueH(parseFloat(e.target.value))}
          />
        </Field>
        <Field label="Path length" htmlFor="fig2-n">
          <Input
            id="fig2-n"
            aria-label="Path length"
            type="number"
            min={500}
            max={10000}
            step={100}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Window size" htmlFor="fig2-window">
          <Input
            id="fig2-window"
            aria-label="Sliding window size"
            type="number"
            min={100}
            max={5000}
            step={50}
            value={windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field
          label="Scales"
          htmlFor="fig2-scales"
          hint="Comma-separated integers"
        >
          <Input
            id="fig2-scales"
            aria-label="Multi-scale values (comma-separated)"
            value={scalesText}
            onChange={(e) => setScalesText(e.target.value)}
          />
        </Field>
      </FigureControls>

      <div id="fig2-chart" className="mt-6">
        <EmptyChart
          ready={grid !== null}
          emptyTitle={copy.figures.emptyTitle}
          emptyDescription={copy.figures.emptyDescription}
          height={360}
        >
          {grid ? (
            <HeatmapGrid scales={grid.scales} cells={grid.cells} />
          ) : null}
        </EmptyChart>
      </div>
    </SectionCard>
  );
}

function Figure3() {
  const [trueH, setTrueH] = React.useState(0.1);
  const [n, setN] = React.useState(2000);
  const [windowSize, setWindowSize] = React.useState(500);
  const [step, setStep] = React.useState(25);
  const [iterations, setIterations] = React.useState(8);
  const [rolling, setRolling] = React.useState<
    Array<{t: number; H: number | null}>
  >([]);

  const render = React.useCallback(() => {
    setRandomSeed(42);
    const path = Array.from(generateFractionalBrownianMotion(n, trueH));
    resetRandomSeed();
    const estimator = new Hurstify({
      scaleA1: 1,
      scaleA2: 25,
      sampleSize: 500,
      iterations,
    });
    const results = estimator.rolling(path, windowSize, step);
    setRolling(results.filter((r) => Number.isFinite(r.H)));
  }, [n, trueH, windowSize, step, iterations]);

  React.useEffect(render, [render]);

  return (
    <SectionCard
      eyebrow="Fig 3"
      title="Rolling estimation"
      description="Sliding-window estimates on a rough-volatility path."
      actions={
        <>
          <Button onClick={render} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {copy.figures.actions.rerender}
          </Button>
          <FigureExportButton targetId="fig3-chart" filename="fig-rolling" />
        </>
      }
    >
      <FigureControls>
        <Field label="True H" htmlFor="fig3-true-h">
          <Input
            id="fig3-true-h"
            aria-label="True Hurst parameter"
            type="number"
            min={0.01}
            max={0.99}
            step={0.01}
            value={trueH}
            onChange={(e) => setTrueH(parseFloat(e.target.value))}
          />
        </Field>
        <Field label="Path length" htmlFor="fig3-n">
          <Input
            id="fig3-n"
            aria-label="Path length"
            type="number"
            min={500}
            max={10000}
            step={100}
            value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Window size" htmlFor="fig3-window">
          <Input
            id="fig3-window"
            aria-label="Sliding window size"
            type="number"
            min={100}
            max={5000}
            step={50}
            value={windowSize}
            onChange={(e) => setWindowSize(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Step" htmlFor="fig3-step">
          <Input
            id="fig3-step"
            aria-label="Rolling step size"
            type="number"
            min={1}
            max={500}
            value={step}
            onChange={(e) => setStep(parseInt(e.target.value, 10))}
          />
        </Field>
        <Field label="Iterations" htmlFor="fig3-iterations">
          <Input
            id="fig3-iterations"
            aria-label="Variance-reduction iterations"
            type="number"
            min={1}
            max={64}
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10))}
          />
        </Field>
      </FigureControls>

      <div id="fig3-chart" className="mt-6">
        <EmptyChart
          ready={rolling.length > 0}
          emptyTitle={copy.figures.emptyTitle}
          emptyDescription={copy.figures.emptyDescription}
          height={320}
        >
          <HTrajChart rolling={rolling} trueH={trueH} />
        </EmptyChart>
      </div>
    </SectionCard>
  );
}

function Figure4() {
  const [hsText, setHsText] = React.useState('0.05, 0.1, 0.2, 0.3');
  const [wsText, setWsText] = React.useState('200, 400, 600, 800, 1000');
  const [trials, setTrials] = React.useState(10);
  const [series, setSeries] = React.useState<
    Array<{trueH: number; rmseByW: number[]; biasByW: number[]}>
  >([]);
  const [windows, setWindows] = React.useState<number[]>([]);

  const render = React.useCallback(() => {
    const hs = hsText
      .split(',')
      .map((s) => parseFloat(s.trim()))
      .filter((v) => !isNaN(v));
    const ws = wsText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((v) => !isNaN(v));
    setWindows(ws);
    const out: Array<{trueH: number; rmseByW: number[]; biasByW: number[]}> =
      [];
    for (const h of hs) {
      const rmseByW: number[] = [];
      const biasByW: number[] = [];
      for (const w of ws) {
        const errors: number[] = [];
        for (let t = 0; t < trials; t++) {
          setRandomSeed(t + 1);
          const path = Array.from(
            generateFractionalBrownianMotion(Math.min(2000, w), h),
          );
          resetRandomSeed();
          const estimator = new Hurstify({sampleSize: Math.min(300, w)});
          try {
            const H = estimator.estimateSingle(path.slice(0, w));
            errors.push(H - h);
          } catch {
            errors.push(NaN);
          }
        }
        const valid = errors.filter((e) => Number.isFinite(e));
        rmseByW.push(
          valid.length
            ? Math.sqrt(valid.reduce((a, b) => a + b * b, 0) / valid.length)
            : NaN,
        );
        biasByW.push(
          valid.length
            ? Math.abs(valid.reduce((a, b) => a + b, 0) / valid.length)
            : NaN,
        );
      }
      out.push({trueH: h, rmseByW, biasByW});
    }
    setSeries(out);
  }, [hsText, wsText, trials]);

  React.useEffect(render, [render]);

  return (
    <SectionCard
      eyebrow="Fig 4"
      title="Bias–variance tradeoff"
      description="RMSE (solid) and |Bias| (dashed) per window, per true H."
      actions={
        <>
          <Button onClick={render} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {copy.figures.actions.rerender}
          </Button>
          <FigureExportButton
            targetId="fig4-chart"
            filename="fig-bias-variance"
          />
        </>
      }
    >
      <FigureControls>
        <Field
          label="H values"
          htmlFor="fig4-hs"
          hint="Comma-separated decimals"
        >
          <Input
            id="fig4-hs"
            aria-label="H values to sweep (comma-separated)"
            value={hsText}
            onChange={(e) => setHsText(e.target.value)}
          />
        </Field>
        <Field
          label="Window sizes"
          htmlFor="fig4-ws"
          hint="Comma-separated integers"
        >
          <Input
            id="fig4-ws"
            aria-label="Window sizes to sweep (comma-separated)"
            value={wsText}
            onChange={(e) => setWsText(e.target.value)}
          />
        </Field>
        <Field label="Trials per config" htmlFor="fig4-trials">
          <Input
            id="fig4-trials"
            aria-label="Trials per config"
            type="number"
            min={1}
            max={50}
            value={trials}
            onChange={(e) => setTrials(parseInt(e.target.value, 10))}
          />
        </Field>
      </FigureControls>

      <div id="fig4-chart" className="mt-6">
        <EmptyChart
          ready={series.length > 0}
          emptyTitle={copy.figures.emptyTitle}
          emptyDescription={copy.figures.emptyDescription}
          height={420}
        >
          <BiasVarianceChart windows={windows} series={series} />
        </EmptyChart>
      </div>
    </SectionCard>
  );
}

function FigureExportButton({
  targetId,
  filename,
}: {
  targetId: string;
  filename: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const onClick = async () => {
    const node = document.getElementById(targetId);
    if (!node) return;
    setBusy(true);
    try {
      const {toPng} = await import('html-to-image');
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-chart-export-bg')
        .trim();
      const dataUrl = await toPng(node, {
        backgroundColor: bg || undefined,
      });
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button onClick={onClick} size="sm" variant="outline" disabled={busy}>
      <Download className="h-4 w-4" aria-hidden="true" />
      {copy.figures.actions.export}
    </Button>
  );
}

function ksRescaled(
  s1: number[],
  s2: number[],
  f1: number,
  f2: number,
): number {
  let i = 0;
  let j = 0;
  let d = 0;
  let cdf1 = 0;
  let cdf2 = 0;
  const n1 = s1.length;
  const n2 = s2.length;
  while (i < n1 && j < n2) {
    const v1 = s1[i] * f1;
    const v2 = s2[j] * f2;
    if (v1 <= v2) {
      cdf1 += 1 / n1;
      i++;
    } else {
      cdf2 += 1 / n2;
      j++;
    }
    d = Math.max(d, Math.abs(cdf1 - cdf2));
  }
  return d;
}
