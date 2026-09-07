/**
 * @fileoverview Public surface for the strategy hierarchy.
 *
 * Every reusable abstraction in hurstify lives under this directory:
 *
 * - `Registry<T>`: keyed lookup for strategy families.
 * - `Sampler`: increment samplers used by `Hurstify.estimate`.
 * - `KsObjective`: KS-distance objectives minimized over `H`.
 * - `Kernel`: fractional-integration kernels.
 * - `StochasticModel`: rough-volatility simulators.
 * - `Forecaster`: H-series forecasters.
 * - `HypothesisTest`: KS / constancy / CUSUM / bootstrap tests.
 *
 * This module re-exports every class and helper so consumers only need
 * a single import line.
 */

export {Registry} from './registry.js';
export {
  Sampler,
  ReservoirSampler,
  BlockPermutationSampler,
  IdentitySampler,
  defaultSampler,
} from './sampler.js';
export {
  KsObjective,
  PairwiseKsObjective,
  MultiScaleKsObjective,
  WeightedMultiScaleKsObjective,
  chooseKsObjective,
} from './ks-objective.js';
export {Kernel, RiemannLiouvilleKernel, TimeVaryingKernel} from './kernel.js';
export {
  StochasticModel,
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  MultifractionalPreModel,
} from './model.js';
export {
  Forecaster,
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
} from './forecaster.js';
export {
  HypothesisTest,
  KsSignificanceTest,
  ConstancyTest,
  CusumBreakTest,
  BootstrapConfidenceInterval,
  ksCriticalValue,
  ksPvalue,
  detectCusumBreakpoints,
} from './hypothesis-test.js';
