/**
 * @fileoverview Public entry point for the hurstify package.
 *
 * This module re-exports every user-facing API of the hurstify library.
 * It is the only file consumers should normally import from when using
 * the package (`import {Hurstify} from 'hurstify';`). The intent is to
 * keep a stable surface even when internal modules are split, renamed,
 * or rearranged.
 *
 * ## Architecture (v2.0.0)
 *
 * The library is now organized around a polymorphic strategy hierarchy
 * under `lib/strategies/`. Each strategy family has its own base class
 * and concrete subclasses; the `Hurstify` estimator injects the right
 * combination at construction time.
 *
 *   lib/
 *   ├── index.js                 <- this file, the public surface
 *   ├── hurstify.js              <- Hurstify class (the estimator)
 *   ├── errors.js                <- HurstifyError + error code enum
 *   ├── stats.js                 <- KS distance, permutation, sampling
 *   ├── prng.js                  <- Seedable mulberry32 PRNG + helpers
 *   ├── logger.js                <- Minimal leveled logger
 *   ├── inference/               <- Asymptotic variance, Kalman, math
 *   ├── strategies/              <- Sampler, KsObjective, Kernel,
 *   │                               StochasticModel, Forecaster,
 *   │                               HypothesisTest, Registry<T>
 *   ├── optimization/            <- Brent, Nelder-Mead, SA, DE, AGS
 *   └── models/                  <- Strategy-class re-exports +
 *                                   registries
 *
 * @see {@link Hurstify} for the main estimator class.
 * @see {@link Sampler}, {@link KsObjective}, {@link Optimizer} for the
 *   pluggable strategy families.
 */

export {Hurstify} from './hurstify.js';
export {HurstifyError, HurstifyErrorCode} from './errors.js';

export {
  computeKsDistance,
  shuffleArray,
  getRandomSample,
  permuteBlocks,
} from './stats.js';

export {
  nextGaussian,
  generateGaussianBatch,
  generateCorrelatedGaussian,
  generateFractionalNoise,
  generateFractionalBrownianMotion,
  computeFractionalKernel,
  computeFractionalIntegral,
} from './stochastic-generators.js';

export {setRandomSeed, resetRandomSeed, nextRandom} from './prng.js';

export {
  LogLevel,
  setLogLevel,
  getLogLevel,
  debug,
  info,
  warn,
  error,
} from './logger.js';

export {
  getAsymptoticVariance,
  getStandardError,
  getConfidenceInterval,
  runKalmanFilter,
  detectCusumBreakpoints,
  ksCriticalValue,
  ksPvalue,
} from './inference.js';

export {
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  EulerMaruyamaFractionalOuModel,
  ExactFractionalOuModel,
  MultifractionalPreModel,
  LocalHolderMultifractionalPreModel,
  ExactMultifractionalPreModel,
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
  getModel,
  registerModel,
  listModels,
  getForecaster,
  registerForecaster,
  listForecasters,
  modelRegistry,
  forecasterRegistry,
} from './models/index.js';

export {
  parseCsv,
  extractSeries,
  parseJson,
  validateNoGaps,
  downsampleSeries,
  computeRealizedVariance,
  computeRealizedVarianceParkinson,
  aggregateDailyRealizedVariance,
  applyLogTransform,
  centerSeries,
  standardizeSeries,
  applyPreprocessingPipeline,
  splitTrainTest,
  createSlidingWindows,
  generateVixLogVolatility,
  generateSpxLogVolatility,
  generateIntradayPrices,
  seriesToCsv,
  preaverageReturns,
  computeRealizedKernel,
  debiasLogVolatility,
} from './data/index.js';

export {
  Optimizer,
  runBrent,
  runNelderMead,
  runSimulatedAnnealing,
  runDifferentialEvolution,
  runAdaptiveGridSearch,
  optimizerRegistry,
  BrentOptimizer,
  AdaptiveGridSearchOptimizer,
  NelderMeadOptimizer,
  SimulatedAnnealingOptimizer,
  DifferentialEvolutionOptimizer,
} from './optimization/index.js';

export {
  Registry,
  Sampler,
  ReservoirSampler,
  BlockPermutationSampler,
  IdentitySampler,
  defaultSampler,
  KsObjective,
  PairwiseKsObjective,
  MultiScaleKsObjective,
  WeightedMultiScaleKsObjective,
  chooseKsObjective,
  Kernel,
  RiemannLiouvilleKernel,
  TimeVaryingKernel,
  StochasticModel,
  Forecaster,
  HypothesisTest,
  KsSignificanceTest,
  ConstancyTest,
  CusumBreakTest,
  BootstrapConfidenceInterval,
} from './strategies/index.js';
