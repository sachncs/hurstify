/**
 * Type declarations for `lib/stochastic-generators.js`.
 */

export declare function nextGaussian(): number;

export declare function generateGaussianBatch(n: number): Float64Array;

export declare function generateCorrelatedGaussian(
  n: number,
  rho: number,
): [Float64Array, Float64Array];

export declare function generateFractionalNoise(
  n: number,
  H: number,
): Float64Array;

export declare function generateFractionalBrownianMotion(
  n: number,
  H: number,
): Float64Array;

export declare function computeFractionalKernel(
  H: number,
  nSteps: number,
  dt: number,
): Float64Array;

export declare function computeFractionalIntegral(
  dW: Float64Array,
  kernel: Float64Array,
  t: number,
): number;
