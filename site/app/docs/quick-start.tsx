'use client';

import * as React from 'react';
import {Check, Copy, Terminal} from 'lucide-react';

const install = `git clone https://github.com/sachncs/hurstify.git
cd hurstify
npm install
npm run build`;

const example = `import { Hurstify, generateFractionalBrownianMotion } from 'hurstify';

const path = generateFractionalBrownianMotion(2000, 0.1);
const estimator = new Hurstify({
  scaleA1: 1, scaleA2: 25, sampleSize: 500, iterations: 16,
});

const result = estimator.estimateSingleWithDiagnostics(path);
console.log(result.H);`;

function CodeCard({label, caption, value}: {label: string; caption: string; value: string}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1400); } catch { /* clipboard unavailable */ } };
  return <div className="code-panel overflow-hidden rounded-2xl border border-border shadow-card"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5 text-primary" /><div><p className="text-xs font-medium text-white">{label}</p><p className="text-[10px] text-white/45">{caption}</p></div></div><button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/60 hover:bg-white/10 hover:text-white">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? 'Copied' : 'Copy'}</button></div><pre className="overflow-x-auto p-5 text-xs leading-6 text-white/85"><code>{value}</code></pre></div>;
}

export function QuickStart() {
  return <div className="mt-8 grid gap-4 lg:grid-cols-2"><CodeCard label="1 · Clone and build" caption="Terminal" value={install} /><CodeCard label="2 · Run an estimate" caption="example.mjs" value={example} /></div>;
}
