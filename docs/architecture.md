# Architecture Guide

This document describes the high-level architecture of the **hurstify**
library — a zero-dependency JavaScript implementation of the RK-SAVR
estimator (Angelini & Bianchi, 2025) for the Hurst parameter of
rough-volatility processes.

## Overview

hurstify is organised around a **strategy-injection architecture**: every
reusable abstraction is a polymorphic base class under `lib/strategies/`,
and the `Hurstify` estimator wires concrete strategies together at
construction time. The codebase keeps a clean separation of concerns
across statistics, optimisation, inference, stochastic simulation, and
forecasting.

## Module Structure

```
lib/
├── index.js               # Central export hub (the only file consumers import from)
├── hurstify.js            # Hurstify estimator class (strategy injection + main pipeline)
├── errors.js              # HurstifyError + error-code enum
├── stats.js               # KS distance, block permutation, reservoir sampling
├── stochastic-generators.js  # Hosking-method fGn/fBm + log-volatility generators
├── prng.js                # Seedable mulberry32 PRNG + helpers
├── logger.js              # Minimal leveled logger
├── strategies/            # Polymorphic base classes for every reusable abstraction
│   ├── registry.js        # Generic Registry<T>
│   ├── sampler.js         # Sampler + Reservoir / BlockPermutation / Identity samplers
│   ├── ks-objective.js    # KsObjective + Pairwise / MultiScale / WeightedMultiScale
│   ├── kernel.js          # Kernel + RiemannLiouville / TimeVarying kernels
│   ├── model.js           # StochasticModel + RoughBergomi / RoughFsv / FractionalOu /
│   │                      #   EulerMaruyamaFractionalOu / ExactFractionalOu /
│   │                      #   MultifractionalPre / LocalHolder- / ExactMultifractionalPre
│   ├── forecaster.js      # Forecaster + Arfima / HoltWinters / Lstm / Attention
│   └── hypothesis-test.js # HypothesisTest + KsSignificanceTest / ConstancyTest /
│                          #   CusumBreakTest / BootstrapConfidenceInterval
├── optimization/          # Brent, Nelder-Mead, SA, DE, AGS + shared optimizerRegistry
├── inference/             # Asymptotic variance, Kalman filter, math helpers
├── data/                  # Loaders, preprocessing, noise correction, synthetic data
└── models/                # Strategy-class re-exports + stochasticModel / forecaster registries
```

## Core Components

### `Hurstify` Class (`lib/hurstify.js`)

The main estimator class that orchestrates the seven-step RK-SAVR
pipeline:

1. **Segmentation** — slice the input window.
2. **Increments** — compute `Z_{t,a} = X_{t+a} − X_t` at the configured scales.
3. **Block permutation** — decorrelate serial dependence while preserving marginals.
4. **Subsampling** — draw `T` increments per scale via Floyd's reservoir sampler.
5. **Rescaling** — apply `a^(−H)`; under the null of self-similarity the
   rescaled samples are i.i.d.
6. **KS minimisation** — find `H ∈ (hMin, hMax)` minimising the
   two-sample KS distance between rescaled samples.
7. **Variance reduction** — average across `K` iterations.

`Sampler`, `KsObjective`, and `Optimizer` strategies are injected at
construction time; look them up by key through the polymorphic
`optimizerRegistry` or pass your own concrete subclass.

**Public methods:**

| Method                                        | Purpose                           |
| --------------------------------------------- | --------------------------------- |
| `estimate(data)`                              | Single-shot `H` estimate.         |
| `estimateSingleWithDiagnostics(data)`         | Returns `{H, D, se, ci, pValue}`. |
| `rolling(data, windowSize, step, onProgress)` | Sliding-window `H` trajectory.    |
| `rollingMultiScale(...)`                      | Multi-scale rolling estimates.    |

### Statistics (`lib/stats.js`)

Core statistical primitives:

- `computeKsDistance(a, b)` — two-sample KS distance.
- `ksDistanceRescaled(...)` — zero-allocation rescaled KS used inside the
  inner loop of every optimiser evaluation.
- `shuffleArray(arr)` — Fisher-Yates shuffle.
- `permuteBlocks(arr, blockSize, offset)` — paper-faithful block
  permutation with optional random phase offset.
- `getRandomSample(arr, n)` — Floyd's reservoir sampler.

### Strategy Hierarchy (`lib/strategies/`)

Every reusable abstraction is a polymorphic base class with a
single-method contract; concrete subclasses dispatch through it:

| Base class        | Concrete subclasses                                                                                                                                            | Polymorphic entry                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `Sampler`         | `ReservoirSampler`, `BlockPermutationSampler`, `IdentitySampler`                                                                                               | `sample(data, n)`                   |
| `KsObjective`     | `PairwiseKsObjective`, `MultiScaleKsObjective`, `WeightedMultiScaleKsObjective`                                                                                | `value(window, scales, weights, h)` |
| `Kernel`          | `RiemannLiouvilleKernel`, `TimeVaryingKernel`                                                                                                                  | `weight(t)`                         |
| `StochasticModel` | `RoughBergomiModel`, `RoughFsvModel`, `FractionalOuModel` (+ `EulerMaruyama-`/`Exact-` discretisations), `MultifractionalPreModel` (+ `LocalHolder-`/`Exact-`) | `simulate(opts)`                    |
| `Forecaster`      | `ArfimaForecaster`, `HoltWintersForecaster`, `LstmForecaster`, `AttentionForecaster`                                                                           | `forecast(series, opts)`            |
| `HypothesisTest`  | `KsSignificanceTest`, `ConstancyTest`, `CusumBreakTest`, `BootstrapConfidenceInterval`                                                                         | `run(...)`                          |

### Optimisation (`lib/optimization/`)

Multiple optimisation algorithms for KS-distance minimisation:

| Optimizer              | Use case            | Notes                       |
| ---------------------- | ------------------- | --------------------------- |
| Brent's method         | 1D smooth functions | Default.                    |
| Nelder-Mead            | Multi-dimensional   | Simplex method.             |
| Simulated annealing    | Global optimisation | Adaptive cooling.           |
| Differential evolution | Population-based    | Crossover + mutation.       |
| Adaptive grid search   | Coarse-to-fine      | Grid then Brent refinement. |

All five share the same polymorphic `Optimizer` interface and are
look-up-by-key through `optimizerRegistry`.

### Inference (`lib/inference/`)

Statistical inference for uncertainty quantification:

- **Asymptotic variance** (`asymptotic.js`) — Proposition 2.9 formula
  `Var(Ĥ) = (2πe)/(ln a)² · (1/√n + 1/√m)²`.
- **Confidence intervals** (`asymptotic.js`) — based on asymptotic normality.
- **Kalman filtering** (`filtering.js`) — state-space smoothing of `H(t)`.
- **CUSUM test** (`filtering.js`) — structural-break detection.
- **Constancy test** (`filtering.js`) — likelihood-ratio test of
  `q = 0` vs. `q > 0` in the Kalman state equation.
- **Bootstrap CI** (`filtering.js`) — non-parametric confidence intervals.

### Stochastic Models (`lib/strategies/model.js`)

Rough-volatility simulators, each a `StochasticModel` subclass:

| Model                     | Description                                                                              |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `RoughBergomiModel`       | One-factor rough Bergomi with async coupling.                                            |
| `RoughFsvModel`           | Rough fractional stochastic volatility with Heston dynamics.                             |
| `FractionalOuModel`       | Fractional Ornstein-Uhlenbeck (Euler-Maruyama and exact discretisations).                |
| `MultifractionalPreModel` | Multifractional process with stochastic `H(t)` (Local-Holder and exact discretisations). |

### Forecasting (`lib/strategies/forecaster.js`)

H-series predictors, each a `Forecaster` subclass:

| Forecaster              | Description                            |
| ----------------------- | -------------------------------------- |
| `ArfimaForecaster`      | Fractional differencing with ARMA.     |
| `HoltWintersForecaster` | Triple-exponential smoothing.          |
| `LstmForecaster`        | Gated recurrent cell with Xavier init. |
| `AttentionForecaster`   | Self-attention (Q/K/V) forecaster.     |

### Random Generation (`lib/stochastic-generators.js`)

Synthetic-data generators built on the seeded `mulberry32` PRNG:

- `generateFractionalNoise(n, H)` — Hosking's method.
- `generateFractionalBrownianMotion(n, H)` — integrated fGn.
- `generateVixStyleLogVolatility(n, params)` — VIX-style log-vol.
- `generateSpxRvStyleLogVolatility(n, params)` — SPX-RV-style log-vol.
- `computeFractionalKernel`, `computeFractionalIntegral` — kernel helpers.

### PRNG (`lib/prng.js`)

Seeded pseudo-random number generator for reproducibility:

- `setRandomSeed(seed)` / `resetRandomSeed()`
- `uniform()` — uniform random number
- `nextGaussian()` — standard normal (Box-Muller)
- `generateGaussianBatch(n)` — vectorised Gaussian batch
- `generateCorrelatedGaussian(n, rho)` — correlated normals via Cholesky

## Data Flow

```
                       ┌──────────────────────┐
  Raw log-volatility → │  Segmentation        │ → overlapping windows
  series               └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  Increment            │  Z_{t,a} = X_{t+a} − X_t
                       │  Computation          │  at scales a₁, a₂ (or multi-scale)
                       └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  Block                │  Decorrelate serial dependence
                       │  Permutation          │  (preserve marginals)
                       └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  Subsampling          │  T increments per scale
                       │  (Floyd reservoir)    │  via the injected Sampler
                       └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  Rescaling            │  a^(−H) so the null of
                       │                       │  self-similarity is i.i.d.
                       └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  KS Distance          │  minimise over H ∈ (hMin, hMax)
                       │  Minimisation         │  using the injected KsObjective
                       │                       │  and Optimizer
                       └──────────┬───────────┘
                                     │
                                     ▼
                       ┌──────────────────────┐
                       │  Variance             │  average across K iterations
                       │  Reduction            │
                       └──────────┬───────────┘
                                     │
                                     ▼
                                Ĥ estimate
```

## Design Patterns

### Strategy Injection

The `Hurstify` constructor accepts concrete strategy instances (or
look-ups through the polymorphic registries). Consumers plug in their
own subclass or look up by key:

```javascript
import {Hurstify, optimizerRegistry} from 'hurstify';

// Look up by key (returns a fresh instance each call)
const Brent = optimizerRegistry.get('brent');

const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 25,
  sampleSize: 500,
  iterations: 16,
  optimizer: Brent,
});
```

### `Registry<T>`

A single generic `Registry<T>` (`lib/strategies/registry.js`) backs
every strategy family — `optimizerRegistry`, `samplerRegistry`,
`kernelRegistry`, `ksObjectiveRegistry`, `modelRegistry`,
`forecasterRegistry`. New entries register via `registry.register(key,
factory)` and resolve via `registry.get(key)`.

### Builder-Style Constructor

`Hurstify` keeps a single flat options object so configuration stays
readable:

```javascript
const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 25,
  sampleSize: 500,
  iterations: 16,
  blockSize: 16,
  optimizerType: 'brent',
  hMin: 0.01,
  hMax: 0.99,
});
```

## Testing Strategy

- **Unit tests** under `tests/unit/` — individual functions and classes.
- **Integration tests** under `tests/integration/` — end-to-end
  `Hurstify.estimateSingle` against synthetic fBm paths.
- **Shared fixtures** under `tests/fixtures/` — reusable fBm helpers.
- **Coverage** — c8 with HTML and text reporters (`npm run test:coverage`).

## Performance Considerations

- **Zero-allocation KS** — `ksDistanceRescaled` applies `a^(−H)`
  inline during the pointer walk, eliminating two array allocations
  per optimiser evaluation.
- **Seeded PRNG** — reproducible simulations without global-state
  pollution; `setRandomSeed` resets the mulberry32 stream.
- **Rolling windows** — per-window failure handling prevents batch
  crashes; `rollingMultiScale` is pure (no `estimator` mutation) so it
  is safe to call concurrently.
- **Optimizer selection** — pick Brent for smooth 1D, Nelder-Mead for
  multi-dimensional, simulated annealing or differential evolution
  for non-convex landscapes, adaptive grid search when you have no
  prior on `H`.
