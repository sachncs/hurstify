# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.0] - 2026-08-28

### Refactor: production-readiness cleanup

- **Strategy-injection rewrite** of `Hurstify`: the `Sampler`, `KsObjective`, and `Optimizer` strategies are now injected at construction time. Consumers plug in concrete subclasses or look up by key through the polymorphic `optimizerRegistry`.
- **Strategy hierarchy** for `Sampler`, `KsObjective`, `Kernel`, `StochasticModel`, `Forecaster`, `HypothesisTest` lives under `lib/strategies/`. Each base class defines the polymorphic entry point; every concrete subclass dispatches through it.
- **Stochastic models** `FractionalOuModel` and `MultifractionalPreModel` are now abstract bases; the Euler-Maruyama / exact-Riemann-Liouville branches are split into concrete subclasses (`EulerMaruyamaFractionalOuModel`, `ExactFractionalOuModel`, `LocalHolderMultifractionalPreModel`, `ExactMultifractionalPreModel`). The `opts.discretization` switch is gone.
- **Generic `Registry<T>`** replaces the ad- `REGISTRY` and `MODEL_REGISTRY` objects. All four strategy families use the same implementation.
- **Removed thin wrappers**: `stubSampler`, `wrapSafeOptimizer`, `getOptimizer`, `resolveOptimizer`, `registerOptimizer`, `runConstancyTest`, `runSignificanceTest`, `runCusumTest`, `bootstrapConfidenceInterval`, `constancyTestVia`, `void runKalmanFilter`, `void constancyTestVia`. Consumers use the strategy classes directly.
- **Removed `_` prefix / suffix** from every identifier across the library (including method names `_sigmoid`/`_tanh`/`_step`/`_matVecMul`/`_softmax`, field names `_step` etc., and the `stub_` test-double). `_` is forbidden everywhere now.
- **Removed all `@private` JSDoc annotations** (12 occurrences). ESLint-compatible workarounds (referencing the param in the throw message) replace them where the param is genuinely unused.
- **Inlined** sigmoid / tanh as one-liners in the LSTM cell-update math; deleted `this._sigmoid` / `this._tanh` class fields.
- **Fixed state-mutation bug** in `rollingMultiScale`: the method no longer mutates `estimator.scales` / `estimator.weights` / `estimator.#objective`. A new private `#estimateAt(window, scales, weights, sampleSize)` helper takes everything as parameters and is safe to call concurrently. Regression test asserts no mutation.
- **Consolidated `kalmanLogLikelihood`** — single source of truth in `lib/strategies/hypothesis-test.js` (was duplicated in `lib/inference/filtering.js`).
- **Fixed** `getConfidenceInterval` signature misuse in the demo web worker.
- **Bumped tests**: 191 → 243.

### Documentation

- **README rewrite**: Restructured the top-level README around a problem/answer elevator pitch, a "Who is this for?" accessibility section, multi-option installation (`npm` vs. from-source), annotated quick-start code blocks, and a "Where to go next" navigation map. The "Configuration" and "API Reference" tables now use a "Plain English" column. The hurstify-specific content (Methodology, Project Structure, Tech Stack, Roadmap, Observatory, References) is preserved and folded into the new layout.

### Fixed

- **CI `npm ci` peer-dependency conflict**: `typescript@^7.0.2` was incompatible with the `typescript@"">=4.8.4 <6.1.0"` peer requirement declared by `@typescript-eslint/eslint-plugin@8.68.0` and `@typescript-eslint/parser@8.68.0` (typescript-eslint 8.x does not yet support TypeScript 7 — see [issue #10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)). Removed the three unused packages (`@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `typescript-eslint`) from `devDependencies` and dropped the `lint:demo:ts` script. `demo/eslint.config.mjs` is preserved as a stub for the day upstream ships TS 7 support.
- **`npm install` deprecation warnings**: forced `glob@^13.0.0` via the existing `overrides` block (the old `glob@10.x` was being pulled in transitively by `mocha@11.8.0` and is unsupported with publicized CVEs), and bumped `recharts` from `^2.15.0` to `^3.10.1` — the 1.x/2.x branches are no longer active, and v3 is compatible with the demo's chart usage (`LineChart`, `BarChart`, `AreaChart`, `CartesianGrid`, `XAxis`/`YAxis`, `Tooltip`, `Legend`, `ReferenceLine`, `ResponsiveContainer`). Demo `npm run build:demo` verified after the bump.
- **`npm run test:coverage` failure**: removed the dead `registerStochasticModels` re-export from `lib/strategies/index.js` — the symbol was imported there but never defined in `lib/strategies/model.js` (a leftover from before the registry pattern), so importing `lib/index.js` under Node's native ESM (`NODE_ENV=test` triggers it via c8) threw `SyntaxError`. Tests now run to completion in both `npm test` and `npm run test:coverage`.
- **README + getting-started install instructions**: dropped the "Option 1 — npm (fastest)" section and the npm-version badge — there is no npm release. Consumers install from source via `git clone` + `npm install`, then link the checkout with `npm link hurstify` from their project. `docs/getting-started.md` updated the same way.
- **docs/ rebrand**: deleted the JSDoc HTML output (`docs/*.html`, `docs/fonts/`, `docs/scripts/`, `docs/styles/`). The docs/ folder is now markdown-only — handwritten `architecture.md` and `getting-started.md` plus the regenerated `API.md` (the latter is at the repo root for `package.json` `files`). `npm run docs` now only invokes `jsdoc2md`.
- **Dropped unused `jsdoc` devDep**: with the HTML output gone, `jsdoc2md` is the only JSDoc-related tool we still need. `jsdoc@^4.0.5` removed from `devDependencies`; `eslint-plugin-jsdoc` and `jsdoc-type-pratt-parser` (transitive) are unaffected.
- **`npm run docs` was silently broken**: `jsdoc2md` exited non-zero on the JSDoc type expressions that use TypeScript-style `import('./…').Name` and `() => T` arrow-function syntax (jsdoc's parser doesn't understand them). The old `npm run docs` swallowed the failure because it piped through to `jsdoc --readme`, which printed warnings and exited 0. Dropped the `jsdoc --readme` step in the previous rebrand and replaced the offending expressions with jsdoc-compatible equivalents — `{import('./x.js').Optimizer}` → `{Optimizer}`, `() => T` → `function(): T`. `npm run docs` now succeeds and writes a fresh `API.md` (~2,740 lines). TS still sees the full type via the `.d.ts` shims.
- **Added `docs/README.md`** as a Markdown-only index for the docs/ folder — links to `getting-started.md`, `architecture.md`, and the published `API.md`; explains how `npm run docs` regenerates the API reference from JSDoc tags.
- **Removed `MIGRATION.md` and `review.md`** — both predate the strategy-injection refactor and the hurstify rebrand. `MIGRATION.md` documented the now-shipped `rksavr` → `hurstify` migration; `review.md` was a fidelity audit against the old `RKSAVR` class / `lib/rksavr.js` layout and referenced paper-fidelity gaps that have since been addressed. Removed the lingering `MIGRATION.md` link from the v2.0.0 entry in this changelog.
- **Fixed `npm run build:demo`**: recharts v3 tightened `Tooltip`'s `Formatter` signature — the parameter is now `ValueType | undefined` instead of `number`. `demo/components/observatory/charts/h-traj-chart.tsx` was using `(v: number) => v.toFixed(4)`, which `tsc` rejected under strict mode. Updated to `(v) => (typeof v === 'number' ? v.toFixed(4) : '')` so the formatter handles the undefined branch the new type allows. Demo now builds cleanly on Node 24/26.

## [2.0.0] - 2026-08-26

### Rebrand: `rksavr` → `hurstify`

This is the v2.0.0 release of the project under its new name: **hurstify**. The
rebrand is cosmetic + ergonomic — algorithm behavior and public API are unchanged.

**Highlights**

- New package name on npm: `hurstify`.
- Demo rewritten as a Next.js 16 + shadcn/ui (new-york) **Observatory**.
- Per-module TypeScript declarations in `lib/*.d.ts`.
- Tests reorganized into `tests/{unit,integration,fixtures}`.
- CI matrix: Node `[24, 26]`. Library Node floor: `>=24`.
- Bundler upgraded to Babel 8; ESLint to 10.9.1; Rollup to 4.63.0.
- Husky + lint-staged + commitlint enforce Conventional Commits.
- CODEOWNERS for `lib/` and `demo/`.
- 191 tests still passing under the new name.

**Migration**

```bash
npm uninstall rksavr
npm install hurstify
```

```diff
-import { RKSAVR } from 'rksavr';
+import { RKSAVR } from 'hurstify';
```

## [2.0.0] - hurstify rebrand

### Changed

- **Brand**: Package renamed from `rksavr` to **`hurstify`**. GitHub repo renamed.
- **Demo**: Vite + Plotly.js SPA ported to **Next.js 16** with **shadcn/ui** (new-york preset), **Tailwind v4**, and **Recharts**. The interactive observatory now lives at `demo/` and runs from `npm run dev:demo` / `npm run build:demo`.
- **Toolchain**: Babel bumped to **v8**, ESLint to **10.9.1**, Rollup to **4.63.0**. Node engines floor raised to **>=24** (CI matrix now `[24, 26]`).
- **Removed**: `vite`, `chart.js`, `plotly.js-dist-min` (legacy demo stack).
- **Type declarations**: Hand-written `lib/*.d.ts` per module for typed imports from the Next.js demo.
- **Tests**: Reorganized into `tests/unit/`, `tests/integration/`, `tests/fixtures/`.

### Added

- **Code-quality gates**: Husky pre-commit, lint-staged on changed files, commitlint enforcing Conventional Commits.
- **CODEOWNERS** for `lib/` and `demo/` directories.
- **Open Graph metadata** in the observatory layout for sharing on socials.

### Preserved

- Public API surface is unchanged: all 190 tests pass under the new name.
- Rollup builds ESM + CJS + IIFE bundles under the new banner.
- Algorithm behavior is bit-identical to v1.x — rebrand was cosmetic + ergonomics.

### Added

#### Production Package Infrastructure

- **Build System** (`rollup.dist.config.js`): Rollup with Babel producing ESM, ES5, CJS, and IIFE bundles.
- **Dual-Format Publishing** (`package.json`): Conditional exports for `import` and `require`, `files` whitelist, zero runtime dependencies.
- **StandardJS Linting**: Replaced ESLint with `standard` + `snazzy` for zero-config linting.
- **Test Framework Migration** (`tests/`): Mocha + Chai with `@babel/register`, `.mocharc.yml`, and 123 tests.
- **Coverage** (`npm run test:coverage`): c8 with HTML/text reporters, 93.56% statement coverage.
- **Documentation** (`npm run docs`): JSDoc HTML (`docs/`) and `API.md` via `jsdoc-to-markdown`.
- **CI/CD** (`.github/workflows/`):
  - `testsuite.yml`: Matrix testing on Node 18/20/22 with lint + test + coverage.
  - `publish.yml`: Docs + build + dry-run publish.
  - `codeql-analysis.yml`: Security analysis.
- **Community Files**: `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue/PR templates, `FUNDING.yml`, `dependabot.yml`.

#### Paper Fidelity & Core Fixes

- **Asymptotic Variance** (`lib/inference/asymptotic.js`): Corrected to Proposition 2.9 formula `(2πe)/(ln a)² · (1/√n + 1/√m)²`.
- **Block Random Permutation** (`lib/stats.js`): Paper-faithful implementation with optional random phase offset, preserving marginal distributions while stripping autocorrelation.
- **Configurable H Bounds** (`lib/rksavr.js`): `hMin`/`hMax` constructor options passed to optimizers and clamped on results.
- **KS Significance Testing** (`lib/inference.js`): `ksCriticalValue`, `ksPvalue`, and `significanceTest` using asymptotic Kolmogorov distribution.
- **Constancy Test** (`lib/inference/filtering.js`): Likelihood ratio test for Kalman `q=0` vs `q>0`.
- **Bootstrap CI** (`lib/inference.js`): Non-parametric bootstrap with seeded PRNG for reproducibility.
- **CUSUM / Breakpoint Detection** (`lib/inference.js`): Structural break detection in H(t) series.

#### Algorithmic Optimizations

- **Zero-Allocation Rescaled KS** (`lib/stats.js:ksDistanceRescaled`): Applies `scale^(-H)` inline during the pointer walk — eliminates two array allocations per optimizer evaluation.
- **Fixed `getIncrementsMulti`** (`lib/rksavr.js`): Replaced buggy single-pass loop with correct per-scale computation.
- **`estimateSingleWithDiagnostics`** (`lib/rksavr.js`): Returns both H and minimized KS distance D.

#### Restored Modules

- **Noise Correction** (`lib/noise.js`): `preavgReturns`, `realizedKernel` (Bartlett/Parzen/Tukey-Hanning), `logVolDebias`.
- **Forecasting** (`lib/models/forecasting.js`): `holtWintersForecast`, `createLSTM` (16/8-dim, Xavier init, full gates), `createAttentionModel` (Q/K/V self-attention).
- **Central Export Hub** (`lib/index.js`): Single entry point re-exporting all public APIs.

### Changed

- **CJS Bundle**: Renamed to `dist/index.cjs` so `require()` works under `"type": "module"`.
- **Demo Dependencies**: `chart.js` and `plotly.js-dist-min` moved from `dependencies` to `devDependencies`.
- **README.md**: Updated repo links, added development workflow, testing, building, and publishing sections.

### Fixed

- `significanceTest` no longer approximates D from variance; it requires the actual minimized KS distance.
- `blockPermutation` random phase no longer drops prefix elements when offset > 0.
- `bootstrapCI` now uses the seeded PRNG instead of `Math.random()`.
- Removed stale `dist/index.cjs.js` build artifacts.

### Removed

- **ESLint**: Replaced by StandardJS (`standard`).
- **Node.js Native Test Runner**: Replaced by Mocha + Chai.
- **`test/rksavr.test.js`**: Migrated to `tests/rksavr.tests.js`.

## [1.1.0] - 2026-05-04

### Added

#### Algorithmic Kernels (Section 1)

- **Nelder-Mead Optimizer** (`lib/optimization.js:nelderMead`): Multi-dimensional simplex method for non-smooth KS distance minimization.
- **Simulated Annealing** (`lib/optimization.js:simulatedAnnealing`): Global optimizer with adaptive cooling to prevent local minima.
- **Differential Evolution** (`lib/optimization.js:differentialEvolution`): Population-based evolutionary optimizer with crossover.
- **Adaptive Grid Search** (`lib/optimization.js:adaptiveGridSearch`): Coarse grid initialization followed by Brent refinement.

#### Multi-Scale Scaling (Section 1.2)

- **Vectorized KS Objective** (`lib/rksavr.js:vectorizedKsObjective`): Compare all scale pairs in a single objective call.
- **Weighted KS Distance** (`lib/stats.js:weightedKsDistance`): Per-scale weighting for heterogeneous scale importance.
- **Scaling Profile** (`lib/stats.js:scalingProfile`): Full multi-scale distance vector for diagnostics.
- **Multi-Scale RKSAVR** (`lib/rksavr.js:RKSAVR.rollingMultiScale`): Comprehensive rolling estimation with profile output.
- **Optimizer Selection**: `optimizerType` config option ('brent', 'nelder-mead', 'annealing', 'de', 'ags').

#### Statistical Robustness (Section 2)

- **Asymptotic Variance** (`lib/inference.js:asymptoticVariance`): Prop 2.9 formula $\frac{2\pi e}{(\ln a)^2}(\frac{1}{\sqrt{n}}+\frac{1}{\sqrt{m}})^2$.
- **Standard Error & CI** (`lib/inference.js:standardError`, `confidenceInterval`): Analytic confidence intervals.
- **Bootstrap CI** (`lib/inference.js:bootstrapCI`): Non-parametric empirical confidence intervals.
- **Kalman Filter** (`lib/inference.js:kalmanFilter`): State-space filtering for temporal H variation.
- **CUSUM Test** (`lib/inference.js:cusumTest`): Structural break detection in H series.
- **Breakpoint Detection** (`lib/inference.js:detectBreakpoints`): Binary segmentation for regime identification.
- **Constancy Test** (`lib/inference.js:constancyTest`): Likelihood ratio test for Kalman $q=0$ vs $q>0$.
- **Preaveraging** (`lib/noise.js:preavgReturns`): Noise mitigation via overlapping returns.
- **Realized Kernel** (`lib/noise.js:realizedKernel`): Bartlett/Parzen/Tukey kernel volatility.
- **Multiscale Decomposition** (`lib/noise.js:multiscaleDecompose`): Trend/noise separation.
- **Log-Vol De-biasing** (`lib/noise.js:logVolDebias`): Non-linear bias correction.
- **Bid-Ask Correction** (`lib/noise.js:bidAskCorrection`): Zero-return tick test filter.
- **Optimal Sampling** (`lib/noise.js:optimalSamplingInterval`): Noise-adaptive interval selection.

#### Financial Engineering (Section 3)

- **rBergomi Model** (`lib/models/rbergomi.js`): One-factor rough Bergomi with async coupling.
- **rFSV Model** (`lib/models/rfsv.js`): Rough fractional stochastic volatility with Heston dynamics.
- **fOU Process** (`lib/models/fou.js`): Fractional Ornstein-Uhlenbeck with exact OU discretization.
- **MPRE** (`lib/models/mpre.js`): Multifractional process with stochastic H exponent.
- **ARFIMA Forecasting** (`lib/models/forecasting.js:arfima`): Fractional differencing with ARMA.
- **LSTM Cell** (`lib/models/forecasting.js:createLSTM`): Simple recurrent cell for H prediction.
- **Attention Model** (`lib/models/forecasting.js:createAttentionModel`): Transformer-style self-attention.
- **Holt-Winters** (`lib/models/forecasting.js:holtWintersForecast`): Exponential smoothing forecast.

### Changed

- `lib/rksavr.js`: Refactored with multi-scale support, optimizer selection, and new objective functions.
- `lib/stats.js`: Added weighted KS, scaling profile, and bootstrap utilities.
- `lib/optimization.js`: Restructured as multi-optimizer suite with consistent API.
- `README.md`: Expanded with multi-scale usage, model examples, and inference documentation.

## [1.0.0] - 2026-05-03

### Added

- Initial RK-SAVR implementation with Brent's method optimizer.
- KS distance and random sampling utilities.
- Fractional Brownian motion generator (Hosking's method).
- Interactive web demo with Chart.js.
- Basic rolling window estimation.
- MIT License.

[Unreleased]: https://github.com/sachncs/hurstify/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/sachncs/hurstify/compare/v2.0.0...v2.1.0
[1.1.0]: https://github.com/sachncs/hurstify/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/sachncs/hurstify/releases/tag/v1.0.0
