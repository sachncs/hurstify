/**
 * Experiment: Rolling window H estimation on synthetic/real data.
 * Reproduces the paper's rolling window analysis (Figure 1 style).
 *
 * Usage:
 *   node experiments/rolling-estimation.js
 *
 * Outputs:
 *   - data/samples/rolling-estimates.json
 */

import {Hurstify} from '../lib/hurstify.js';
import {
  generateVixLogVolatility,
  generateSpxLogVolatility,
} from '../lib/data/synthetic.js';
import {setRandomSeed} from '../lib/prng.js';
import {writeFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs rolling window estimation on a log-volatility series.
 *
 * @param {Array<number>} logVol Log-volatility series.
 * @param {Object} config Hurstify configuration.
 * @param {number} windowSize Window size.
 * @param {number} step Step size.
 * @return {Array<Object>} Rolling estimates.
 */
export function runRollingExperiment(logVol, config, windowSize, step) {
  const estimator = new Hurstify(config);
  return estimator.rolling(logVol, windowSize, step);
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

  setRandomSeed(42);
  const vixLogVol = generateVixLogVolatility(1500, 0.1, {
    seed: 42,
    noiseStd: 0.05,
  });
  const vixResults = runRollingExperiment(vixLogVol, config, windowSize, step);

  setRandomSeed(123);
  const spxLogVol = generateSpxLogVolatility(1500, 0.14, {
    seed: 123,
    noiseStd: 0.03,
  });
  const spxResults = runRollingExperiment(spxLogVol, config, windowSize, step);

  const output = {
    config,
    windowSize,
    step,
    vix: {
      trueH: 0.1,
      estimates: vixResults,
    },
    spx: {
      trueH: 0.14,
      estimates: spxResults,
    },
  };

  const outPath = join(
    __dirname,
    '..',
    'data',
    'samples',
    'rolling-estimates.json',
  );
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Rolling estimates written to ${outPath}`);
  const vixValid = vixResults.filter((r) => r.H !== null);
  const spxValid = spxResults.filter((r) => r.H !== null);
  console.log(
    `VIX avg H: ${vixValid.reduce((a, b) => a + b.H, 0) / vixValid.length}`,
  );
  console.log(
    `SPX avg H: ${spxValid.reduce((a, b) => a + b.H, 0) / spxValid.length}`,
  );

  const csvPath = join(
    __dirname,
    '..',
    'data',
    'samples',
    'rolling-estimates.csv',
  );
  const csvLines = ['dataset,t,H'];
  for (const r of vixResults) {
    if (r.H !== null) csvLines.push(`vix,${r.t},${r.H}`);
  }
  for (const r of spxResults) {
    if (r.H !== null) csvLines.push(`spx,${r.t},${r.H}`);
  }
  writeFileSync(csvPath, csvLines.join('\n'));
  console.log(`CSV written to ${csvPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
