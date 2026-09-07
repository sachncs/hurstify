/**
 * Experiment: Constancy test on rolling H estimates.
 * Reproduces the paper's likelihood ratio test (Table 1 style).
 *
 * Usage:
 *   node experiments/constancy-test.js
 *
 * Outputs:
 *   - data/samples/constancy-test-results.json
 */

import {Hurstify} from '../lib/hurstify.js';
import {ConstancyTest} from '../lib/inference.js';
import {
  generateVixLogVolatility,
  generateSpxLogVolatility,
} from '../lib/data/synthetic.js';
import {generateFractionalBrownianMotion} from '../lib/stochastic-generators.js';
import {setRandomSeed} from '../lib/prng.js';
import {writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const constancyTest = new ConstancyTest();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs constancy test on rolling H estimates.
 *
 * @param {Array<number>} logVol Log-volatility series.
 * @param {Object} config Hurstify configuration.
 * @param {number} windowSize Window size.
 * @param {number} step Step size.
 * @param {Object} kalmanOpts Kalman filter options.
 * @return {{estimates: Array<Object>, constancy: Object}} Results.
 */
export function runConstancyExperiment(
  logVol,
  config,
  windowSize,
  step,
  kalmanOpts = {},
) {
  const estimator = new Hurstify(config);
  const estimates = estimator
    .rolling(logVol, windowSize, step)
    .filter((r) => r.H !== null)
    .map((r) => r.H);

  const constancy = constancyTest.run(estimates, kalmanOpts);
  return {estimates, constancy};
}

/**
 * Runs the full experiment suite.
 */
export function main() {
  const windowSize = 512;
  const step = 20;
  const config = {
    scaleA1: 1,
    scaleA2: 50,
    sampleSize: 500,
    iterations: 16,
    blockSize: 16,
    hMin: 0.01,
    hMax: 0.5,
  };

  const kalmanOpts = {q: 0.01, r: 0.1};

  setRandomSeed(42);
  const vixLogVol = generateVixLogVolatility(1500, 0.1, {seed: 42});
  const vixResult = runConstancyExperiment(
    vixLogVol,
    config,
    windowSize,
    step,
    kalmanOpts,
  );

  setRandomSeed(123);
  const spxLogVol = generateSpxLogVolatility(1500, 0.14, {seed: 123});
  const spxResult = runConstancyExperiment(
    spxLogVol,
    config,
    windowSize,
    step,
    kalmanOpts,
  );

  setRandomSeed(999);
  const n = 1500;
  const fbm1 = generateFractionalBrownianMotion(Math.floor(n / 2), 0.1);
  const fbm2 = generateFractionalBrownianMotion(Math.ceil(n / 2), 0.3);
  const mixedLogVol = [...fbm1, ...fbm2].map((v) => 1.5 + v * 0.4);
  const mixedResult = runConstancyExperiment(
    mixedLogVol,
    config,
    windowSize,
    step,
    kalmanOpts,
  );

  const output = {
    config,
    windowSize,
    step,
    kalmanOpts,
    results: {
      vix: {
        label: 'VIX-style (constant H=0.1)',
        nEstimates: vixResult.estimates.length,
        meanH:
          vixResult.estimates.reduce((a, b) => a + b, 0) /
          vixResult.estimates.length,
        constancy: vixResult.constancy,
      },
      spx: {
        label: 'SPX-style (constant H=0.14)',
        nEstimates: spxResult.estimates.length,
        meanH:
          spxResult.estimates.reduce((a, b) => a + b, 0) /
          spxResult.estimates.length,
        constancy: spxResult.constancy,
      },
      mixed: {
        label: 'Mixed regime (H changes from 0.1 to 0.3)',
        nEstimates: mixedResult.estimates.length,
        meanH:
          mixedResult.estimates.reduce((a, b) => a + b, 0) /
          mixedResult.estimates.length,
        constancy: mixedResult.constancy,
      },
    },
  };

  const outPath = join(
    __dirname,
    '..',
    'data',
    'samples',
    'constancy-test-results.json',
  );
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Constancy test results written to ${outPath}`);
  console.log('Summary:');
  for (const [key, val] of Object.entries(output.results)) {
    const sig = val.constancy.constant ? 'CONSTANT' : 'TIME-VARYING';
    console.log(
      `  ${key}: mean H=${val.meanH.toFixed(3)}, p-value=${val.constancy.pValue.toFixed(4)}, ${sig}`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
