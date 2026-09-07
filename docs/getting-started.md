# Getting Started with hurstify

This guide walks you through installing hurstify and estimating the
Hurst parameter of a log-volatility series in a few lines of code.

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or newer
- npm (ships with Node)

## Installation

The package is consumed directly from the source tree — there is no
npm release.

### From Source

```bash
git clone https://github.com/sachncs/hurstify.git
cd hurstify
npm install
```

Zero runtime dependencies. The Rollup build ships ESM, CJS, and IIFE
bundles under `dist/`.

### Linking From Another Project

```bash
# In the hurstify checkout
npm link

# In your project
npm link hurstify
```

Then `import {Hurstify} from 'hurstify'` resolves to the linked
source tree.

## Basic Usage

### ES Modules (Recommended)

```javascript
import {Hurstify, generateFractionalBrownianMotion} from 'hurstify';

// Generate a synthetic rough-volatility path with H = 0.1
const path = generateFractionalBrownianMotion(2000, 0.1);

// Estimate Ĥ in a single call
const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 25,
  sampleSize: 500,
  iterations: 16,
});

const hEstimate = r.estimateSingle(path);
console.log(`Estimated H = ${hEstimate.toFixed(3)} (true: 0.100)`);
```

### CommonJS

```javascript
const {Hurstify, generateFractionalBrownianMotion} = require('hurstify');

const path = generateFractionalBrownianMotion(2000, 0.1);

const r = new Hurstify({
  scaleA1: 1,
  scaleA2: 25,
  sampleSize: 500,
  iterations: 16,
});

const hEstimate = r.estimateSingle(path);
console.log(`Estimated H = ${hEstimate.toFixed(3)} (true: 0.100)`);
```

### Browser (IIFE)

```html
<script src="dist/index.iife.js"></script>
<script>
  const r = new hurstify.Hurstify({
    scaleA1: 1,
    scaleA2: 25,
    sampleSize: 500,
    iterations: 16,
  });
  console.log(r.estimateSingle(path));
</script>
```

## Configuration Options

The `Hurstify` constructor accepts the following options:

| Option          | Type            | Default   | Description                                                    |
| --------------- | --------------- | --------- | -------------------------------------------------------------- |
| `scaleA1`       | `number`        | `1`       | Lower scale for increment computation.                         |
| `scaleA2`       | `number`        | `50`      | Upper scale for increment computation.                         |
| `sampleSize`    | `number`        | `500`     | Increments sampled per scale.                                  |
| `iterations`    | `number`        | `16`      | Variance-reduction iterations.                                 |
| `blockSize`     | `number`        | `16`      | Block length for random permutation.                           |
| `optimizerType` | `string`        | `'brent'` | `'brent'`, `'nelder-mead'`, `'annealing'`, `'de'`, or `'ags'`. |
| `hMin`          | `number`        | `0.01`    | Lower bound on `H`.                                            |
| `hMax`          | `number`        | `0.99`    | Upper bound on `H`.                                            |
| `scales`        | `Array<number>` | `null`    | Multi-scale array; overrides `scaleA1` / `scaleA2`.            |
| `weights`       | `Array<number>` | `null`    | Per-scale weights (must match `scales` length).                |
| `sampler`       | `function`      | —         | Custom `(data, n) => sample`.                                  |

## Rolling-Window Analysis

Estimate `H` along a sliding window:

```javascript
const windowSize = 512;
const step = 20;

const results = r.rolling(path, windowSize, step, (progress) => {
  console.log(`Progress: ${(progress * 100).toFixed(1)}%`);
});

// results => [{ t: 0, H: 0.12 }, { t: 20, H: 0.14 }, ...]
```

## Statistical Inference

Pull asymptotic variance, confidence intervals, the Kalman filter, and
the bootstrap CI directly from the public API:

```javascript
import {
  asymptoticVariance,
  confidenceInterval,
  kalmanFilter,
  cusumTest,
  constancyTest,
  bootstrapCI,
} from 'hurstify';

// Proposition 2.9 asymptotic variance
const varH = asymptoticVariance(1, 50, 500, 500);

// Asymptotic CI
const [lo, hi] = confidenceInterval(0.12, 1, 50, 500, 500, 0.05);

// Kalman-smoothed H(t)
const filtered = kalmanFilter(hHistory, {q: 0.01, r: 0.1});

// Structural-break test
const breaks = cusumTest(hHistory);

// Constancy of H
const constancy = constancyTest(hHistory);

// Bootstrap CI
const ci = bootstrapCI((w) => r.estimateSingle(w), path, 1000, 0.05);
```

## Diagnostics

`estimateSingleWithDiagnostics` returns the full picture — point
estimate, KS distance, significance, standard error, and CI in one
call:

```javascript
const diag = r.estimateSingleWithDiagnostics(path);
console.log({
  H: diag.H,
  ksDistance: diag.D,
  se: diag.se,
  ci: diag.ci,
  pValue: diag.pValue,
});
```

## Rough-Volatility Models

Generate synthetic paths from the strategy-class simulator zoo and
estimate `H` from them:

```javascript
import {
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  MultifractionalPreModel,
} from 'hurstify';

const path = new RoughBergomiModel({h: 0.1, eta: 2.0, rho: -0.8}).simulate({
  nSteps: 252,
});

const hEstimate = r.estimateSingle(path);
```

## Forecasting `H(t)`

Predict the next-step Hurst parameter from an H-series:

```javascript
import {ArfimaForecaster, HoltWintersForecaster, createLstm} from 'hurstify';

const arfima = new ArfimaForecaster({arOrder: 1, maOrder: 1, dOrder: 0.4});
const forecast = arfima.forecast(hHistory, {horizon: 5});
```

## Next Steps

- Read the [API Reference](../API.md) for the full symbol list.
- Read the [Architecture Guide](architecture.md) for the strategy-injection design.
- Explore the [interactive observatory](../demo/) — launch it locally with
  `npm run dev:demo`.
- See [CONTRIBUTING.md](../CONTRIBUTING.md) if you'd like to contribute.
