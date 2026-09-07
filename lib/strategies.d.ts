/**
 * Type declarations for the hurstify strategy hierarchy.
 */

export declare class Registry<T> {
  register(name: string, factory: () => T): void;
  resolve(name: string): T | undefined;
  resolveOr(name: string, fallback: string | T): T;
  list(): string[];
  unregister(name: string): boolean;
}

export declare abstract class Sampler {
  abstract draw(inc: number[] | Float64Array, n: number): number[];
}

export declare class ReservoirSampler extends Sampler {
  constructor(opts?: Record<string, unknown>);
}

export declare class BlockPermutationSampler extends Sampler {
  constructor(blockSize: number, randomPhase?: boolean);
  blockSize: number;
  randomPhase: boolean;
}

export declare class IdentitySampler extends Sampler {
  constructor(opts?: Record<string, unknown>);
}

export declare function defaultSampler(
  blockSize: number | null | undefined,
): Sampler;

export declare abstract class KsObjective {
  abstract evaluate(
    sortedSamples: Array<Float64Array | number[]>,
    scales: number[],
    H: number,
  ): number;
}

export declare class PairwiseKsObjective extends KsObjective {
  constructor(opts?: Record<string, unknown>);
}

export declare class MultiScaleKsObjective extends KsObjective {}

export declare class WeightedMultiScaleKsObjective extends KsObjective {
  constructor(weights: number[]);
  weights: number[];
}

export declare function chooseKsObjective(
  scales?: number[] | null,
  weights?: number[] | null,
): KsObjective;

export declare abstract class Kernel {
  abstract evaluate(t: number): number;
  precompute(nSteps: number, dt: number): Float64Array;
}

export declare class RiemannLiouvilleKernel extends Kernel {
  constructor(H: number);
  H: number;
  coefficient: number;
}

export declare class TimeVaryingKernel extends Kernel {
  constructor(hPath: Array<number> | Float64Array, dt?: number);
  hPath: Array<number> | Float64Array;
  dt: number;
}

export interface SimulationResult {
  paths: Float64Array[];
  times: number[];
  brownians: Float64Array[];
}

export interface PriceResult {
  prices: Float64Array[];
  volatilities: Float64Array[];
  times: number[];
}

export declare abstract class StochasticModel {
  abstract simulate(opts?: Record<string, unknown>): SimulationResult;
  price(sim: SimulationResult, opts?: Record<string, unknown>): PriceResult;
}

export interface RoughBergomiOptions {
  nPaths?: number;
  nSteps?: number;
  xi?: number;
  eta?: number;
  rho?: number;
  h?: number;
  T?: number;
  mu?: number;
  s0?: number;
}

export declare class RoughBergomiModel extends StochasticModel {}

export interface RoughFsvOptions {
  nSteps?: number;
  T?: number;
  h?: number;
  theta?: number;
  mu?: number;
  nu?: number;
  alpha?: number;
  v0?: number;
  s0?: number;
  drift?: number;
}

export declare class RoughFsvModel extends StochasticModel {}

export interface FractionalOuOptions {
  nSteps?: number;
  T?: number;
  theta?: number;
  mu?: number;
  sigma?: number;
  h?: number;
  x0?: number;
  discretization?: 'euler-maruyama' | 'exact';
}

export declare abstract class FractionalOuModel extends StochasticModel {}

export declare class EulerMaruyamaFractionalOuModel extends FractionalOuModel {}

export declare class ExactFractionalOuModel extends FractionalOuModel {}

export interface MultifractionalPreOptions {
  nSteps?: number;
  T?: number;
  hMin?: number;
  hMax?: number;
  h0?: number;
  x0?: number;
  hProcess?: {
    theta?: number;
    mu?: number;
    sigma?: number;
  };
}

export declare abstract class MultifractionalPreModel extends StochasticModel {}

export declare class LocalHolderMultifractionalPreModel extends MultifractionalPreModel {}

export declare class ExactMultifractionalPreModel extends MultifractionalPreModel {}

export declare abstract class Forecaster {
  abstract predict(history: number[]): number;
  forecast(history: number[]): number;
}

export interface ArfimaOptions {
  p?: number;
  d?: number;
  q?: number;
  window?: number;
}

export declare class ArfimaForecaster extends Forecaster {
  constructor(opts?: ArfimaOptions);
}

export interface HoltWintersOptions {
  alpha?: number;
  beta?: number;
}

export declare class HoltWintersForecaster extends Forecaster {
  constructor(opts?: HoltWintersOptions);
}

export interface LstmOptions {
  hiddenSize?: number;
  inputSize?: number;
}

export declare class LstmForecaster extends Forecaster {
  constructor(opts?: LstmOptions);
}

export interface AttentionOptions {
  hiddenSize?: number;
}

export declare class AttentionForecaster extends Forecaster {
  constructor(opts?: AttentionOptions);
}

export declare abstract class HypothesisTest {
  abstract run(data: unknown, opts?: Record<string, unknown>): unknown;
}

export interface KsSignificanceResult {
  significant: boolean;
  pValue: number;
  statistic: number;
  criticalValue: number;
}

export declare class KsSignificanceTest extends HypothesisTest {}

export interface ConstancyResult {
  lrStat: number;
  pValue: number;
  constant: boolean;
}

export declare class ConstancyTest extends HypothesisTest {}

export interface CusumBreakResult {
  breakDetected: boolean;
  maxCusum: number;
  breakIndex: number;
}

export declare class CusumBreakTest extends HypothesisTest {}

export interface BootstrapCiResult {
  lower: number;
  upper: number;
  pointEstimate: number;
}

export declare class BootstrapConfidenceInterval extends HypothesisTest {}

export declare function ksCriticalValue(
  n: number,
  m: number,
  alpha?: number,
): number;

export declare function ksPvalue(D: number, n: number, m: number): number;

export declare function detectCusumBreakpoints(
  hHistory: number[],
  windowSize?: number,
  threshold?: number,
): Array<{index: number; H_before: number; H_after: number}>;
