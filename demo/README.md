# hurstify — Observatory (demo)

The interactive Next.js 16 demo for `hurstify`. Runs the **Observatory** —
a three-pane dashboard for live Hurst parameter estimation, parameter grid
search, and paper-figure replication.

## Quickstart

From the repo root:

```bash
npm install
npm run dev:demo       # http://localhost:5173
```

To build for production:

```bash
npm run build:demo     # outputs .next in this directory
npm run start:demo     # serves the production build
```

## Pages

- `/` — redirects to `/dashboard`.
- `/dashboard` — Real-time Hurst estimation with synthetic path generation.
- `/explorer` — Parameter grid search across `H`, window sizes, optimizers.
- `/figures` — Replicated figures from Angelini & Bianchi (2025).

## Architecture

- **App Router** (Next.js 16.3+).
- **Tailwind CSS 4** (CSS-based `@theme`).
- **shadcn/ui** (new-york preset, neutral base overridden to hurstify palette).
- **Recharts** (via shadcn `chart` wrapper) for visualization.
- **Web Worker** (Turbopack-bundled) for off-main-thread compute.

## Importing from the library

The Next.js app imports the library source directly via a path alias:

```ts
import {Hurstify, generateFBM} from '../../../lib/index.js';
```

`next.config.ts` enables `experimental.externalDir` so the bundler picks up
files outside the demo root.

## Troubleshooting

- **Worker won't start**: ensure your browser isn't blocking module workers;
  some privacy extensions do.
- **Next build fails on `lib/` files**: confirm Babel preset-env is v8.
- **CSS variables look wrong**: confirm `globals.css` is loaded in `app/layout.tsx`.
