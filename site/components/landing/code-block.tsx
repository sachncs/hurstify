'use client';

import * as React from 'react';
import {Copy} from 'lucide-react';

export function CodeBlock({code}: {code: string}) {
  return (
    <div className="code-panel overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/60">
        <span>example.mjs</span>
        <button
          type="button"
          className="inline-flex items-center gap-1"
          onClick={() => navigator.clipboard?.writeText(code)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-xs leading-6 text-white/85">
        <code>{code}</code>
      </pre>
    </div>
  );
}
