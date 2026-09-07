/**
 * @fileoverview KS-objective strategy hierarchy.
 *
 * The Hurstify estimator minimizes a Kolmogorov–Smirnov-based objective
 * over the trial Hurst parameter `H`. The objective depends on the
 * number of scales and whether the caller supplied per-scale weights;
 * the concrete classes below cover every supported configuration.
 *
 * All three concrete classes implement the same evaluate(...) method so
 * the estimator dispatches polymorphically without branching on the
 * scale count.
 *
 * - {@link PairwiseKsObjective}: single pair (two scales).
 * - {@link MultiScaleKsObjective}: arithmetic mean over all `K(K-1)/2`
 *   unordered scale pairs.
 * - {@link WeightedMultiScaleKsObjective}: weighted generalization with
 *   a normalization that keeps the value in `[0, 1]`.
 */

import {computeKsDistanceRescaled} from '../stats.js';

/**
 * Abstract base class for KS-distance objectives.
 *
 * @abstract
 */
export class KsObjective {
  /**
   * Evaluates the objective at the trial `H`.
   *
   * @param {Array<Float64Array>} sortedSamples One pre-sorted sample per
   *   scale (each of equal length).
   * @param {Array<number>} scales Scale values matching `sortedSamples`.
   * @param {number} H Trial Hurst parameter.
   * @return {number} Non-negative objective value.
   * @abstract
   */
  evaluate(sortedSamples, scales, H) {
    throw new Error(
      `${this.constructor.name}.evaluate(scales[${scales.length}], ${H}) is not implemented`,
    );
  }
}

/**
 * Two-scale pairwise KS objective.
 *
 * Rescales the two sorted samples by `scales[i]^{-H}` and returns the
 * KS distance between them.
 */
export class PairwiseKsObjective extends KsObjective {
  /**
   * @param {Object=} opts Reserved for future use (e.g. sign of H).
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  evaluate(sortedSamples, scales, H) {
    const [factorA, factorB] = scales.map((s) => Math.pow(s, -H));
    return computeKsDistanceRescaled(
      sortedSamples[0],
      sortedSamples[1],
      factorA,
      factorB,
    );
  }
}

/**
 * Multi-scale unweighted KS objective.
 *
 * Returns the arithmetic mean of the pairwise KS distances over every
 * unordered pair `(i, j)` with `i < j`. Equivalent to the paper's
 * recommended extension to `K > 2` scales.
 */
export class MultiScaleKsObjective extends KsObjective {
  /** @override */
  evaluate(sortedSamples, scales, H) {
    const n = sortedSamples.length;
    let total = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const factorI = Math.pow(scales[i], -H);
        const factorJ = Math.pow(scales[j], -H);
        total += computeKsDistanceRescaled(
          sortedSamples[i],
          sortedSamples[j],
          factorI,
          factorJ,
        );
        count++;
      }
    }
    return count > 0 ? total / count : 0;
  }
}

/**
 * Multi-scale weighted KS objective.
 *
 * Weights the pair `(i, j)` by `weights[i] * weights[j]` and normalizes
 * by the sum of those weights so the result stays in `[0, 1]` regardless
 * of the absolute weight magnitudes.
 *
 * @param {Array<number>} weights Per-scale positive weights (length must
 *   match `scales`).
 */
export class WeightedMultiScaleKsObjective extends KsObjective {
  /**
   * @param {Array<number>} weights Per-scale positive weights.
   */
  constructor(weights) {
    super();
    if (!Array.isArray(weights) || weights.length === 0) {
      throw new Error(
        'WeightedMultiScaleKsObjective: weights must be a non-empty array',
      );
    }
    if (weights.some((w) => !Number.isFinite(w) || w <= 0)) {
      throw new Error(
        'WeightedMultiScaleKsObjective: weights must be positive finite numbers',
      );
    }
    this.weights = weights.slice();
  }

  /** @override */
  evaluate(sortedSamples, scales, H) {
    const n = sortedSamples.length;
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const factorI = Math.pow(scales[i], -H);
        const factorJ = Math.pow(scales[j], -H);
        const dist = computeKsDistanceRescaled(
          sortedSamples[i],
          sortedSamples[j],
          factorI,
          factorJ,
        );
        const w = this.weights[i] * this.weights[j];
        total += w * dist;
        weightSum += w;
      }
    }
    return weightSum > 0 ? total / weightSum : 0;
  }
}

/**
 * Selects the right `KsObjective` for a configuration.
 *
 * @param {Array<number>=} scales Optional scale array.
 * @param {Array<number>=} weights Optional weights.
 * @return {KsObjective} The matching strategy.
 */
export function chooseKsObjective(scales, weights) {
  const n = scales && scales.length > 0 ? scales.length : 2;
  if (n > 2 && weights) {
    return new WeightedMultiScaleKsObjective(weights);
  }
  if (n > 2) {
    return new MultiScaleKsObjective();
  }
  return new PairwiseKsObjective();
}
