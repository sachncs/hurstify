<p align="center">
  <h1 align="center">hurstify</h1>
  <p align="center">A zero-dependency JavaScript library for estimating the Hurst parameter of rough-volatility processes.</p>
  <p align="center">
    <a href="#installation"><img src="https://img.shields.io/badge/node-26%2B-brightgreen" alt="Node"></a>
    <a href="https://github.com/sachncs/hurstify/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/sachncs/hurstify/ci.yml?branch=master" alt="Build Status"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
    <a href="https://github.com/sachncs/hurstify/actions"><img src="https://img.shields.io/github/actions/workflow/status/sachncs/hurstify/ci.yml?branch=master" alt="CI"></a>
    <a href="https://github.com/sachncs/hurstify/stargazers"><img src="https://img.shields.io/github/stars/sachncs/hurstify" alt="Stars"></a>
  </p>
</p>

---

## What is this?

hurstify is a small JavaScript tool that answers one question:

> _"Given a series of volatility observations, how rough is it?"_

Roughness is captured by a single number called the **Hurst parameter** (`H`). `H` close to `0` means very rough (jumpy, anti-persistent), `H` close to `1` means very smooth (trending, persistent), and `H = 0.5` is the familiar Brownian-motion middle ground.

You feed hurstify a time series; it hands you back `Ĥ` — a number between `0` and `1`.

> **The problem.** Estimating `H` for rough-volatility processes is hard. Parametric models miss the point, and historical estimators carry estimator bias and slow windows.
>
> **The answer.** hurstify gives you a one-call estimator for `H` built on the **RK-SAVR algorithm** — the rescaled, multi-sample, block-permuted Kolmogorov–Smirnov distance developed by Angelini & Bianchi (2025). Zero dependencies, runs anywhere JavaScript runs.

---

## Who is this for?

You, even if:

- You're new to JavaScript or Node.js.
- You've never worked with financial time series.
- You've never heard of fractional Brownian motion.

If you can install Node and type commands into a terminal, you can
use hurstify. When the docs use a word you don't know, search for it
in the [API Reference](#api-reference).

If you've used Node.js before, you'll be productive in five minutes.

---

## What can it do?

- **Single-shot H estimation** — One call returns an `H` estimate for a stationary window.
- **Multi-scale analysis** — Compare rescaled distributions across multiple scales with optional weights.
- **Block random permutation** — Decorrelate serial dependence while preserving marginals.
- **Variance reduction** — Repeated subsampling and averaging across `K` independent iterations.
- **Pluggable optimizers** — Brent's method, Nelder-Mead, simulated annealing, differential evolution, and adaptive grid search.
- **Statistical inference** — Asymptotic variance (Prop 2.9), confidence intervals, KS significance testing, Kalman filtering, CUSUM break detection, constancy tests, bootstrap CIs.
- **Synthetic data** — Hosking-method fBm/fGn, VIX-style and SPX-RV-style log-volatility generators.
- **Rough-volatility model zoo** — Simulators for rBergomi, rFSV, fOU, and mPRE processes.
- **H-forecasting** — ARFIMA, Holt-Winters, and LSTM-style predictors.
- **Noise correction** — Preaveraging, realized kernel, log-volatility de-biasing.
- **Zero runtime dependencies** — Pure JavaScript, ESM + CJS + IIFE distributions.
- **Observatory demo** — Interactive Next.js 16 + shadcn/ui app for live H estimation, parameter grid search, and replicated paper figures.

---

## Before you start

You'll need **Node.js 24 or newer** installed on your computer.

If you don't know what Node is or whether you have it:

1. Open a terminal (on macOS: `Cmd + Space`, type "Terminal"; on
   Windows: open "PowerShell"; on Linux: open your usual terminal).
2. Type `node --version` and press Enter.
3. If you see a version number starting with `v24` or `v26`, you're
   set.
4. If you see "command not found" or an older version, follow the
   [official Node installer guide](https://nodejs.org/en/download).

You'll also need **git** (a tool for downloading code). Same drill:
type `git --version` in your terminal.

---

## Installation

The package is consumed directly from the source tree — there is no
npm release. Clone the repo and install dependencies:

A "virtual environment" equivalent in Node is just installing
dependencies per project — Node resolves modules automatically, so
you don't need to worry about polluting your global install.

```bash
# 1. Download the code
git clone https://github.com/sachncs/hurstify.git
cd hurstify

# 2. Install dependencies
npm install

# 3. Run the test suite to confirm everything works
npm test
```

> 💡 **The `cd hurstify` is intentional.** It switches into the
> cloned project directory.

After this, you can also launch the interactive observatory:

```bash
npm run dev:demo
```

Then open the URL it prints (typically `http://localhost:5173`).

To import hurstify from your own project, link the cloned checkout:

```bash
# In the hurstify checkout
npm link

# In your project
npm link hurstify
```

Then `import {Hurstify} from 'hurstify'` resolves to the linked
source tree.

---

## Your first run — Node.js

Open a Node interpreter (`node` in your terminal) and try this:

```javascript
import {Hurstify, generateFBM} from 'hurstify';

// Generate a synthetic rough-volatility path with H = 0.1
// (Fractional Brownian motion with a Hurst parameter of 0.1)
const path = generateFBM(2000, 0.1);

// Estimate Ĥ in a single call
const r = new Hurstify({
  scaleA1: 1, // smallest scale to compare
  scaleA2: 25, // largest scale to compare
  sampleSize: 500, // increments per scale
  iterations: 16, // variance-reduction iterations
});
const H = r.estimateSingle(path);
console.log(`Ĥ = ${H.toFixed(3)} (true: 0.100)`);
```

You'll see something like `Ĥ = 0.107 (true: 0.100)`. That means
hurstify correctly recovered a roughness very close to the true value
of `0.1` from a noisy sample of `2000` points.

For multi-scale analysis:

```javascript
const r = new Hurstify({
  scales: [1, 2, 5, 10, 20, 50],
  weights: [1.0, 0.8, 0.6, 0.4, 0.2, 0.1],
  sampleSize: 500,
  iterations: 8,
});
const multiResults = r.rollingMultiScale(
  path,
  512,
  [1, 2, 5, 10, 20, 50],
  [1, 0.8, 0.6, 0.4, 0.2, 0.1],
  20,
);
```

For rolling estimation across a long series:

```javascript
const windowSize = 512; // width of the sliding window
const step = 20; // how far to advance each window
const results = r.rolling(path, windowSize, step, (p) => {
  console.log(`Progress: ${(p * 100).toFixed(1)}%`);
});
// results: [{ t: 0, H: 0.12 }, { t: 20, H: 0.14 }, ...]
```

---

## Configuration

Want to change something? Pass an options object when creating the
estimator:

```javascript
const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 50,
  sampleSize: 500,
  iterations: 16,
  blockSize: 16,
  optimizerType: 'brent',
  hMin: 0.01,
  hMax: 0.99,
});
```

What each field means:

| Field           | Plain English                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `scaleA1`       | Smallest scale at which to compute increments. Default `1`.                                      |
| `scaleA2`       | Largest scale at which to compute increments. Default `50`.                                      |
| `sampleSize`    | Number of increments sampled per scale. Default `500`.                                           |
| `iterations`    | How many times to repeat the estimator and average. More = lower variance, slower. Default `16`. |
| `blockSize`     | Length of the blocks used in random permutation. Default `16`.                                   |
| `optimizerType` | Which optimizer to use: `brent`, `nelder-mead`, `annealing`, `de`, or `ags`. Default `brent`.    |
| `hMin`          | Lower bound on `H`. Default `0.01`.                                                              |
| `hMax`          | Upper bound on `H`. Default `0.99`.                                                              |
| `scales`        | Array of scales for multi-scale analysis. Overrides `scaleA1` / `scaleA2`. Default `null`.       |
| `weights`       | Per-scale weights (must match `scales` length). Default `null` (uniform).                        |
| `sampler`       | Custom `(data, n) => sample` function. Default — internal reservoir sampler.                     |

### Optimizer selection

| Optimizer              | Key             | Best for            |
| ---------------------- | --------------- | ------------------- |
| Brent's method         | `'brent'`       | Smooth 1D (default) |
| Nelder-Mead            | `'nelder-mead'` | Multi-dimensional   |
| Simulated annealing    | `'annealing'`   | Global optimization |
| Differential evolution | `'de'`          | Population-based    |
| Adaptive grid search   | `'ags'`         | Coarse-to-fine      |

---

## API Reference

| Symbol                                          | What it does                                |
| ----------------------------------------------- | ------------------------------------------- |
| `Hurstify`                                      | Main estimator (two-scale and multi-scale). |
| `Hurstify#estimate(data)`                       | Single-shot `H` estimate.                   |
| `Hurstify#estimateSingleWithDiagnostics(data)`  | Returns `H`, `D`, significance, SE, CI.     |
| `Hurstify#rolling(data, w, step, onProgress)`   | Sliding-window `H` trajectory.              |
| `Hurstify#rollingMultiScale(...)`               | Multi-scale rolling estimates.              |
| `asymptoticVariance(a1, a2, n, m)`              | Prop 2.9 asymptotic variance.               |
| `confidenceInterval(h, a1, a2, n, m, alpha)`    | Confidence interval for `H`.                |
| `kalmanFilter(series, opts)`                    | Kalman-smoothed `H` series.                 |
| `cusumTest(series, opts)`                       | CUSUM structural-break test.                |
| `constancyTest(series)`                         | Constancy-of-H test.                        |
| `bootstrapCI(estimator, data, B, alpha)`        | Bootstrap CI.                               |
| `rBergomi / rFSV / fOU / mPRE`                  | Rough-volatility path simulators.           |
| `arfima / holtWintersForecast / createLSTM`     | H-forecasting predictors.                   |
| `preavgReturns / realizedKernel / logVolDebias` | Microstructure-noise correction.            |

---

## Methodology

Given a stationary window `X_0, …, X_{W-1}` of a log-volatility
series:

1. **Segmentation** — Slice into overlapping windows.
2. **Increments** — Compute `Z_{t,a} = X_{t+a} − X_t` at scales `a₁`
   and `a₂` (or a multi-scale array).
3. **Block permutation** — Randomly permute blocks to remove temporal
   correlation, preserving marginals.
4. **Subsampling** — Draw `T` increments per scale via Floyd's
   reservoir sampler.
5. **Rescaling** — Rescale by `a^(−H)`; under the null of
   self-similarity the rescaled samples are i.i.d.
6. **KS minimization** — Find `H ∈ (0, 1)` minimizing the two-sample
   KS distance between rescaled samples.
7. **Variance reduction** — Average across `K` iterations.

The asymptotic variance of `Ĥ` (Proposition 2.9 in the paper):

```
Var(Ĥ) = (2 π e) / (ln(a₂ / a₁))² × (1/√n + 1/√m)²
```

Doubling the sample sizes halves the SE; widening the scale ratio
shrinks it quadratically.

---

## Where to go next

- **[API Reference](#api-reference)** — Full list of symbols and
  methods. Bookmark this once you start writing real code.
- **[Methodology](#methodology)** — The seven-step pipeline behind
  the estimator.
- **[Observatory](#observatory)** — Launch the interactive Next.js +
  shadcn/ui app and explore `H` visually.
- **[Project Structure](#project-structure)** — How the package is
  laid out, for the curious.
- **[Tech Stack](#tech-stack)** — Build tools, test runners, and
  bundler choices.
- **[Roadmap](#roadmap)** — Where the project is heading.

For operators / maintainers:

- **[Development](#development)** — Run lint, tests, builds, and
  docs.
- **[References](#references)** — The papers, methods, and algorithms
  that inspired hurstify.

---

## Observatory

hurstify ships an interactive Next.js 16 + shadcn/ui app for live
`H` estimation, parameter grid search, and replicated paper figures.

```bash
npm run dev:demo
```

Then open the URL it prints (typically `http://localhost:5173`).
Useful when you'd rather click than code.

---

## Project Structure

```
hurstify/
├── lib/                       # Core library (zero runtime deps)
│   ├── index.js               # Public API entry
│   ├── hurstify.js            # Main estimator class
│   ├── stats.js               # KS distance, block permutation, sampling
│   ├── optimization/          # Brent, Nelder-Mead, SA, DE, AGS
│   ├── inference/             # Asymptotic variance, Kalman, CUSUM
│   ├── data/                  # Loaders, preprocessing, noise correction
│   ├── models/                # rBergomi, rFSV, fOU, mPRE
│   ├── random.js              # Hosking fGn/fBm
│   ├── prng.js                # Seedable mulberry32 PRNG
│   └── logger.js              # Leveled logger
├── demo/                      # Next.js 16 + shadcn/ui observatory
├── tests/                     # Mocha + Chai test suites
│   ├── unit/                  #   unit tests
│   ├── integration/           #   end-to-end tests
│   └── fixtures/              #   shared test data
├── .github/                   # CI, issue templates, CODEOWNERS
└── docs/                      # Generated JSDoc
```

---

## Development

```bash
git clone https://github.com/sachncs/hurstify.git
cd hurstify
npm install
npm run lint          # ESLint + Prettier
npm run test          # Mocha + Chai test suites
npm run build         # Rollup → dist/
npm run docs          # JSDoc → docs/ + API.md
npm run dev:demo      # Next.js observatory
```

---

## Tech Stack

| Layer    | Choice                                                    |
| -------- | --------------------------------------------------------- |
| Language | JavaScript (ES2022+) + TypeScript declarations            |
| Bundler  | Rollup with Babel 8                                       |
| Test     | Mocha + Chai + c8                                         |
| Lint     | ESLint 10 (Google config) + Prettier 3                    |
| Docs     | JSDoc + jsdoc-to-markdown                                 |
| Demo     | Next.js 16 + React 19 + Tailwind 4 + shadcn/ui (new-york) |

---

## Roadmap

- **v1.0** — Current: core RK-SAVR estimator, multi-scale analysis,
  statistical inference, model zoo, forecasting.
- **v2.0** — Rebrand to `hurstify`, per-module TypeScript declarations,
  Next.js 16 + shadcn observatory.
- **v2.1** — React Hook Form for advanced parameter sweeps, persistent
  demo state, dark/light theme toggle.
- **v3.0** — Real-time WebSocket demo with streaming estimator;
  integration with VIX/SPX-RV reference datasets.

---

## Contributing

Want to improve hurstify? See [CONTRIBUTING.md](CONTRIBUTING.md) for
how to set up a development environment and submit changes.

## Code of Conduct

We expect everyone to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Found a security issue? See [SECURITY.md](SECURITY.md) — please don't
open a public GitHub issue for security problems.

## License

[MIT](LICENSE) © 2025–2026 Sachin.

This is an **independent implementation** of the RK-SAVR algorithm
described in _Randomized Kolmogorov-Smirnov Analysis of Volatility
Roughness_ ([arXiv:2509.20015v3](https://arxiv.org/abs/2509.20015v3))
by Angelini & Bianchi. The author is not affiliated with the paper's
authors. Provided as-is for research and educational use. Please cite
the original paper when using this library in academic work.

---

## References

- Angelini & Bianchi (2025). _Randomized Kolmogorov-Smirnov Analysis
  of Volatility Roughness_.
  [arXiv:2509.20015v3](https://arxiv.org/abs/2509.20015v3).
- Bianchi (2004). _A new distribution-based estimator of the
  self-similarity parameter_.
- Bayer, Friz, Gatheral (2016). _Roughing it up: Connecting rough
  volatility with option pricing_.
- Gatheral, Jaisson, Rosenbaum (2018). _Volatility is Rough_.
- Hosking (1984). _Modeling persistence in hydrological time series
  using fractional differencing_.
- Mandelbrot & Van Ness (1968). _Fractional Brownian motions,
  fractional noises and applications_.
- Brent (1971). _Algorithms for Minimization without Derivatives_.
