'use client';

import * as React from 'react';
import {Check, Copy, Terminal} from 'lucide-react';
import {HighlightedCode} from '@/components/landing/highlighted-code';

export function CodeBlock({code}: {code: string}) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard unavailable.
    }
  };
  return (
    <div className="code-panel overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-white/75">example.mjs</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          onClick={copy}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-xs leading-6 text-white/85">
        <code>
          <HighlightedCode code={code} />
        </code>
      </pre>
    </div>
  );
}
