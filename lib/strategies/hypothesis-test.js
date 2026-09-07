/**
 * @fileoverview Hypothesis-test strategy hierarchy.
 *
 * Wraps the suite of statistical tests consumed by hurstify
 * (significance, constancy, structural break, bootstrap CI) under a
 * polymorphic `HypothesisTest` base class. Concrete subclasses expose a
 * uniform `run(data, opts)` interface so callers (e.g. dashboards,
 * notebooks) can dispatch by name without bespoke branching.
 *
 * - {@link KsSignificanceTest}: KS-distance significance on the
 *   minimized statistic returned by `Hurstify.estimateSingle`.
 * - {@link ConstancyTest}: likelihood-ratio test for `q = 0` vs `q > 0`
 *   under the 1D Kalman filter state-space model.
 * - {@link CusumBreakTest}: one-sided CUSUM structural-break detector.
 * - {@link BootstrapConfidenceInterval}: percentile bootstrap CI for an
 *   arbitrary estimator.
 */

import {normalCdf} from '../inference/math.js';
import {nextRandom} from '../prng.js';

/**
 * @template Result
 * Abstract base class for hypothesis tests on H-series.
 *
 * @abstract
 */
export class HypothesisTest {
  /**
   * Runs the test on `data` with the supplied options.
   *
   * @param {*} data Test input (depends on the concrete test).
   * @param {Object} opts Test options.
   * @return {Result} Test result bundle.
   * @abstract
   */
  run(data, opts = {}) {
    throw new Error(
      `${this.constructor.name}.run(${JSON.stringify(data)}, ${JSON.stringify(opts)}) is not implemented`,
    );
  }
}

/**
 * @typedef {{
 *   significant: boolean,
 *   pValue: number,
 *   statistic: number,
 *   criticalValue: number
 * }} KsSignificanceResult
 */

/**
 * KS-distance significance test on the minimized statistic returned by
 * `Hurstify.estimateSingle`.
 *
 * Under the null of self-similarity at the estimated `H` the minimized
 * KS distance should be near the asymptotic critical value; rejecting
 * the null suggests the estimator should be treated with caution.
 */
export class KsSignificanceTest extends HypothesisTest {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  run(data, opts = {}) {
    const D = data.D;
    const n = data.n;
    const m = data.m;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.05;
    if (!Number.isFinite(D) || D < 0) {
      throw new Error(
        'KsSignificanceTest: D must be a non-negative finite number',
      );
    }
    const criticalValue = ksCriticalValue(n, m, alpha);
    const pValue = ksPvalue(D, n, m);
    return {
      significant: pValue < alpha,
      pValue,
      statistic: D,
      criticalValue,
    };
  }
}

/**
 * Two-sample Kolmogorov–Smirnov asymptotic critical value.
 *
 *     D_alpha = sqrt(-0.5 * ln(alpha / 2)) * sqrt((n + m) / (n * m))
 *
 * @param {number} n First sample size.
 * @param {number} m Second sample size.
 * @param {number} alpha Significance level (default `0.05`).
 * @return {number} Critical value `D_alpha`.
 */
export function ksCriticalValue(n, m, alpha = 0.05) {
  if (n <= 0 || m <= 0) throw new Error('Sample sizes must be positive');
  if (alpha <= 0 || alpha >= 1) throw new Error('alpha must be in (0, 1)');
  const factor = Math.sqrt(-0.5 * Math.log(alpha / 2));
  const nmFactor = Math.sqrt((n + m) / (n * m));
  return factor * nmFactor;
}

/**
 * Approximate two-sample KS p-value via the asymptotic Kolmogorov
 * distribution.
 *
 *     Q(lambda) ~ 2 * sum_{j=1..3} (-1)^{j-1} * exp(-2 j^2 lambda^2)
 *
 * with the standard `lambda` correction.
 *
 * @param {number} D Observed KS distance.
 * @param {number} n First sample size.
 * @param {number} m Second sample size.
 * @return {number} Approximate p-value in `[0, 1]`.
 */
export function ksPvalue(D, n, m) {
  if (D < 0) return 1;
  const nm = (n * m) / (n + m);
  const lambda = (Math.sqrt(nm) + 0.12 + 0.11 / Math.sqrt(nm)) * D;
  let sum = 0;
  for (let j = 1; j <= 3; j++) {
    const sign = j % 2 === 1 ? 1 : -1;
    sum += sign * Math.exp(-2 * j * j * lambda * lambda);
  }
  return Math.max(0, Math.min(1, 2 * sum));
}

/**
 * @typedef {{
 *   lrStat: number,
 *   pValue: number,
 *   constant: boolean
 * }} ConstancyResult
 */

/**
 * Likelihood-ratio constancy test for a series of H estimates under a
 * 1D Kalman-filter state-space model.
 */
export class ConstancyTest extends HypothesisTest {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  run(observations, opts = {}) {
    const q1 = opts.q !== undefined ? opts.q : 0.01;
    const r = opts.r !== undefined ? opts.r : 0.1;
    const ll1 = kalmanLogLikelihood(observations, q1, r);
    const ll0 = kalmanLogLikelihood(observations, 0, r);
    const lrStat = 2 * (ll1 - ll0);
    const pValue = 2 * (1 - normalCdf(Math.sqrt(Math.max(0, lrStat))));
    return {
      lrStat,
      pValue,
      constant: pValue > 0.05,
    };
  }
}

/**
 * Log-likelihood of the observations under a 1D Kalman filter.
 *
 * @param {Array<number>} observations Time-ordered `H` estimates.
 * @param {number} q Process-noise variance.
 * @param {number} r Measurement-noise variance.
 * @return {number} Total log-likelihood (or `-Infinity` for empty input).
 */
function kalmanLogLikelihood(observations, q, r) {
  const n = observations.length;
  if (n === 0) return -Infinity;
  let x = observations[0];
  let p = 1.0;
  let logLikelihood = 0;
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const xPred = x;
      const pPred = p + q;
      const z = observations[i];
      const innovation = z - xPred;
      const innovationVar = pPred + r;
      logLikelihood +=
        -0.5 *
        (Math.log(2 * Math.PI * innovationVar) +
          (innovation * innovation) / innovationVar);
      const k = pPred / innovationVar;
      x = xPred + k * innovation;
      p = (1 - k) * pPred;
    } else {
      logLikelihood += -0.5 * Math.log(2 * Math.PI * r);
    }
  }
  return logLikelihood;
}

/**
 * @typedef {{
 *   breakDetected: boolean,
 *   maxCusum: number,
 *   breakIndex: number
 * }} CusumBreakResult
 */

/**
 * One-sided CUSUM structural-break detector on standardized residuals.
 */
export class CusumBreakTest extends HypothesisTest {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  run(hHistory, opts = {}) {
    const targetH = opts.targetH;
    const threshold = opts.threshold !== undefined ? opts.threshold : 3.0;
    const n = hHistory.length;
    if (n === 0) throw new Error('hHistory must be non-empty');
    const residuals = hHistory.map((h) => h - targetH);
    const meanRes = residuals.reduce((a, b) => a + b, 0) / n;
    const stdRes = Math.sqrt(
      residuals.map((r) => (r - meanRes) ** 2).reduce((a, b) => a + b, 0) / n,
    );
    if (stdRes === 0) {
      return {breakDetected: false, maxCusum: 0, breakIndex: -1};
    }
    const standardized = residuals.map((r) => (r - meanRes) / stdRes);
    let cusum = 0;
    let maxCusum = 0;
    let breakIndex = -1;
    for (let i = 0; i < n; i++) {
      cusum += standardized[i];
      cusum = Math.max(0, cusum);
      if (cusum > maxCusum) {
        maxCusum = cusum;
        breakIndex = i;
      }
    }
    return {
      breakDetected: maxCusum > threshold,
      maxCusum,
      breakIndex,
    };
  }
}

/**
 * @typedef {{
 *   lower: number,
 *   upper: number,
 *   pointEstimate: number
 * }} BootstrapCiResult
 */

/**
 * Percentile bootstrap CI for an arbitrary estimator function.
 */
export class BootstrapConfidenceInterval extends HypothesisTest {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  run(data, opts = {}) {
    const estimator = opts.estimator;
    if (typeof estimator !== 'function') {
      throw new Error(
        'BootstrapConfidenceInterval: estimator must be a function',
      );
    }
    const window = data.window;
    const nBoot = opts.nBoot !== undefined ? opts.nBoot : 1000;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.05;
    if (!window || window.length === 0) {
      throw new Error('window must be non-empty');
    }
    const pointEstimate = estimator(window);
    const bootEstimates = [];
    for (let b = 0; b < nBoot; b++) {
      const sample = [];
      for (let i = 0; i < window.length; i++) {
        const idx = Math.floor(nextRandom() * window.length);
        sample.push(window[idx]);
      }
      try {
        bootEstimates.push(estimator(sample));
      } catch {
        // Discard failed bootstrap iterations.
      }
    }
    bootEstimates.sort((a, b) => a - b);
    if (bootEstimates.length === 0) {
      return {lower: pointEstimate, upper: pointEstimate, pointEstimate};
    }
    const lowerIdx = Math.floor((alpha / 2) * bootEstimates.length);
    const upperIdx = Math.floor((1 - alpha / 2) * bootEstimates.length);
    return {
      lower: bootEstimates[lowerIdx] || pointEstimate,
      upper: bootEstimates[upperIdx] || pointEstimate,
      pointEstimate,
    };
  }
}

/**
 * Detects breakpoints in a series of H estimates via a sliding-window
 * CUSUM.
 *
 * @param {Array<number>} hHistory Time-ordered series of `H` estimates.
 * @param {number} windowSize Sliding window size (default `50`).
 * @param {number} threshold CUSUM threshold (default `3.0`).
 * @return {Array<{index: number, H_before: number, H_after: number}>}
 *   Detected breakpoints in chronological order.
 */
export function detectCusumBreakpoints(
  hHistory,
  windowSize = 50,
  threshold = 3.0,
) {
  const cusumTest = new CusumBreakTest();
  const breakpoints = [];
  for (let i = windowSize; i < hHistory.length - windowSize; i++) {
    const before = hHistory.slice(i - windowSize, i);
    const after = hHistory.slice(i, i + windowSize);
    const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
    const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;
    const stdBefore = Math.sqrt(
      before.map((x) => (x - meanBefore) ** 2).reduce((a, b) => a + b, 0) /
        before.length,
    );
    if (stdBefore === 0) continue;
    const result = cusumTest.run(after, {targetH: meanBefore, threshold});
    if (result.breakDetected) {
      breakpoints.push({index: i, H_before: meanBefore, H_after: meanAfter});
    }
  }
  return breakpoints;
}
