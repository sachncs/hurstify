/**
 * Type declarations for the optimizer strategy hierarchy.
 */

export interface BrentResult {
  x: number;
  f: number;
}

export declare abstract class Optimizer {
  abstract minimize(
    objective: (h: number) => number,
    lower: number,
    upper: number,
    initial: number,
  ): number;
}

export declare class BrentOptimizer extends Optimizer {}
export declare class AdaptiveGridSearchOptimizer extends Optimizer {}
export declare class NelderMeadOptimizer extends Optimizer {}
export declare class SimulatedAnnealingOptimizer extends Optimizer {}
export declare class DifferentialEvolutionOptimizer extends Optimizer {}

export declare const optimizerRegistry: import('./strategies.js').Registry<Optimizer>;

export declare function runBrent(
  f: (x: number) => number,
  ax: number,
  bx: number,
  cx: number,
  tol?: number,
): BrentResult;

export declare function runNelderMead(
  f: (xs: number[]) => number,
  x0: number[],
  opts?: {
    maxIter?: number;
    tol?: number;
    alpha?: number;
    gamma?: number;
    rho?: number;
    sigma?: number;
  },
): {x: number[]; f: number};

export declare function runSimulatedAnnealing(
  f: (xs: number[]) => number,
  x0: number[],
  opts?: {maxIter?: number; coolingRate?: number; stepSize?: number},
): {x: number[]; f: number};

export declare function runDifferentialEvolution(
  f: (xs: number[]) => number,
  x0: number[],
  opts?: {maxIter?: number; popSize?: number; cr?: number; f?: number},
): {x: number[]; f: number};

export declare function runAdaptiveGridSearch(
  f: (x: number) => number,
  min: number,
  max: number,
  opts?: {gridSize?: number; refineIters?: number; tol?: number},
): BrentResult;
