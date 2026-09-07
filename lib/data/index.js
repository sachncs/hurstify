/**
 * @fileoverview Re-exports for the data pipeline layer.
 *
 * Single import surface for the four data submodules: loaders
 * (`loaders.js`), preprocessing (`preprocess.js`), synthetic data
 * generators (`synthetic.js`), and microstructure-noise corrections
 * (`noise.js`).
 */

export {
  parseCsv,
  extractSeries,
  parseJson,
  validateNoGaps,
  downsampleSeries,
} from './loaders.js';

export {
  computeRealizedVariance,
  computeRealizedVarianceParkinson,
  aggregateDailyRealizedVariance,
  applyLogTransform,
  centerSeries,
  standardizeSeries,
  applyPreprocessingPipeline,
  splitTrainTest,
  createSlidingWindows,
} from './preprocess.js';

export {
  generateVixLogVolatility,
  generateSpxLogVolatility,
  generateIntradayPrices,
  seriesToCsv,
} from './synthetic.js';

export {
  preaverageReturns,
  computeRealizedKernel,
  debiasLogVolatility,
} from './noise.js';
