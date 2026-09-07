/**
 * Type declarations for `lib/inference.js`.
 */

export interface ConfidenceInterval {
  lower: number;
  upper: number;
}

export interface KalmanResult {
  filtered: number[];
  predictions: number[];
}

export interface CusumResult {
  breakDetected: boolean;
  maxCusum: number;
  breakIndex: number;
}

export interface ConstancyResult {
  lrStat: number;
  pValue: number;
  constant: boolean;
}

export interface SignificanceResult {
  significant: boolean;
  pValue: number;
  statistic: number;
  criticalValue: number;
}

export interface BootstrapCiResult {
  lower: number;
  upper: number;
  pointEstimate: number;
}

export declare function getAsymptoticVariance(
  a1: number,
  a2: number,
  n: number,
  m: number,
): number;

export declare function getStandardError(
  a1: number,
  a2: number,
  n: number,
  m: number,
): number;

export declare function getConfidenceInterval(
  h: number,
  a1: number,
  a2: number,
  n: number,
  m: number,
  alpha?: number,
): ConfidenceInterval;

export declare function runKalmanFilter(
  series: number[],
  options: {q?: number; r?: number},
): KalmanResult;

export declare function ksCriticalValue(
  n: number,
  m: number,
  alpha?: number,
): number;

export declare function ksPvalue(D: number, n: number, m: number): number;

export declare function runSignificanceTest(
  D: number,
  n: number,
  m: number,
  alpha?: number,
): SignificanceResult;

export declare function runCusumTest(
  hHistory: number[],
  targetH: number,
  threshold?: number,
): CusumResult;

export declare function detectCusumBreakpoints(
  hHistory: number[],
  windowSize?: number,
  threshold?: number,
): Array<{index: number; H_before: number; H_after: number}>;

export declare class ConstancyTest {
  run(series: number[], options?: {q?: number; r?: number}): ConstancyResult;
}

export declare class BootstrapConfidenceInterval {
  run(
    data: {window: number[]},
    options: {
      estimator: (data: number[]) => number;
      nBoot?: number;
      alpha?: number;
    },
  ): BootstrapCiResult;
}
