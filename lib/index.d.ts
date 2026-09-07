/**
 * Type re-exports for the hurstify public API.
 *
 * v2.0.0 is a hard break from v1.x. Every public function has been
 * renamed to follow Google's verb-noun convention; legacy names are
 * gone.
 */

export {Hurstify} from './hurstify.js';
export type {HurstifyConfig} from './hurstify.js';
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
  ksCriticalValue,
  ksPvalue,
  detectCusumBreakpoints,
  KsSignificanceTest,
  ConstancyTest,
  CusumBreakTest,
  BootstrapConfidenceInterval,
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

export type {
  RoughBergomiOptions,
  RoughFsvOptions,
  FractionalOuOptions,
  MultifractionalPreOptions,
  ArfimaOptions,
  HoltWintersOptions,
  LstmOptions,
  AttentionOptions,
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
  BrentOptimizer,
  AdaptiveGridSearchOptimizer,
  NelderMeadOptimizer,
  SimulatedAnnealingOptimizer,
  DifferentialEvolutionOptimizer,
  runBrent,
  runNelderMead,
  runSimulatedAnnealing,
  runDifferentialEvolution,
  runAdaptiveGridSearch,
  optimizerRegistry,
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

export type {
  SimulationResult,
  PriceResult,
  KsSignificanceResult,
  ConstancyResult,
  CusumBreakResult,
  BootstrapCiResult,
} from './strategies.js';
