/**
 * Type declarations for the hurstify `Hurstify` estimator class.
 */

import type {Sampler, KsObjective} from './strategies.js';

export interface HurstifyConfig {
  scaleA1?: number;
  scaleA2?: number;
  scales?: number[] | null;
  weights?: number[] | null;
  sampleSize?: number;
  iterations?: number;
  blockSize?: number | null;
  optimizerType?: 'brent' | 'nelder-mead' | 'annealing' | 'de' | 'ags';
  optimizer?: import('./optimization.js').Optimizer;
  sampler?: Sampler;
  objective?: KsObjective;
  hMin?: number;
  hMax?: number;
}

export interface EstimateResult {
  H: number;
  minimizedD: number;
}

export interface ProfileResult {
  H: number;
  minimizedD: number;
  sortedSamples: Float64Array[];
  scaleValues: number[];
}

export interface RollingWindowResult {
  t: number;
  H: number | null;
  profile?: number[];
  error?: string | null;
}

export declare class Hurstify {
  constructor(config?: HurstifyConfig);
  validateConfig(): void;
  estimate(window: number[]): number;
  estimateSingle(window: number[], opts?: Partial<HurstifyConfig>): number;
  estimateSingleWithDiagnostics(
    window: number[],
    opts?: Partial<HurstifyConfig>,
  ): EstimateResult;
  profile(window: number[], opts?: Partial<HurstifyConfig>): ProfileResult;
  rolling(
    series: number[],
    windowSize: number,
    step?: number,
    onProgress?: (p: number) => void,
  ): RollingWindowResult[];
  rollingMultiScale(
    series: number[],
    windowSize: number,
    scales: number[],
    weights?: number[] | null,
    step?: number,
    onProgress?: (p: number) => void,
  ): RollingWindowResult[];
  estimateBatch(
    windows: number[][],
  ): Array<{H: number | null; error: string | null}>;
  static getIncrements(series: number[], scale: number): Float64Array;
  static getIncrementsMulti(
    series: number[],
    scales: number[],
  ): Map<number, Float64Array>;
  static registerOptimizer(
    name: string,
    factory: () => import('./optimization.js').Optimizer,
  ): void;
}
