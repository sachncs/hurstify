/**
 * @fileoverview hurstify estimator core.
 *
 * Implements the **Randomized Kolmogorov-Smirnov Analysis of Volatility
 * Roughness** (RK-SAVR) algorithm of Angelini & Bianchi (arXiv:2509.20015v3)
 * in pure JavaScript, exposed under the hurstify package name.
 *
 * ## Strategy injection
 *
 * `Hurstify` is a thin orchestrator: every pluggable behaviour is
 * delegated to a strategy instance:
 *
 * - {@link Sampler} — `Sampler` strategy (reservoir / block permutation).
 * - {@link KsObjective} — `KsObjective` strategy (pairwise / multi-scale /
 *   weighted multi-scale).
 * - {@link Optimizer} — `Optimizer` strategy (Brent, Nelder-Mead, SA, DE,
 *   AGS, or any user-registered factory).
 *
 * Subclasses implement their respective polymorphic entry point, and the
 * estimator dispatches through the uniform method without any branching.
 *
 * ## Algorithm
 *
 * 1. Compute increments `Z_{t,a} = X_{t + a} - X_t` for every configured
 *    scale.
 * 2. Use the configured `Sampler` to draw `sampleSize` increments per
 *    scale. Block random permutation is selected automatically when
 *    `blockSize > 0`.
 * 3. Sort the samples (assumed by the inner KS walk).
 * 4. For each candidate `H`, evaluate the configured `KsObjective` on
 *    the rescaled samples.
 * 5. Minimize the objective over `H` with the configured `Optimizer`.
 * 6. Repeat the single-shot procedure `iterations` times and average.
 *
 * @see ./stats.js for the underlying statistical primitives.
 * @see ./strategies/* for the polymorphic strategy hierarchy.
 * @see ./logger.js for the leveled logging used for non-fatal failures.
 */

import {
  Sampler,
  defaultSampler,
  chooseKsObjective,
  KsObjective,
} from './strategies/index.js';
import {Optimizer, optimizerRegistry} from './optimization/index.js';
import {computeKsDistanceRescaled} from './stats.js';
import {warn, error} from './logger.js';
import {HurstifyError} from './errors.js';

/**
 * Randomized Kolmogorov-Smirnov Analysis of Volatility Roughness
 * estimator.
 *
 * Wraps the configuration (scales, sample size, sampler, optimizer, KS
 * objective, h bounds) and exposes the same public API as v1.x — but
 * every pluggable concern now lives behind a strategy.
 *
 * Lifecycle:
 *   1. The constructor stores the configuration and resolves the
 *      sampler / KS-objective / optimizer strategies once. The estimator
 *      is therefore stateful across calls — each call to
 *      {@link Hurstify#estimate} draws a fresh independent PRNG state
 *      via `prng.js`.
 *   2. {@link Hurstify#estimate} averages `iterations` independent
 *      {@link Hurstify#estimateSingle} results for variance reduction.
 *   3. {@link Hurstify#rolling} and {@link Hurstify#rollingMultiScale}
 *      are convenience wrappers around a sliding window of these
 *      estimates.
 *   4. {@link Hurstify#estimateBatch} performs non-overlapping window
 *      estimation for parallel processing pipelines.
 *
 * @see ./strategies/sampler.js
 * @see ./strategies/ks-objective.js
 * @see ./optimization/registry.js
 */
export class Hurstify {
  /**
   * The strategy-pattern sampler. Inferred from `blockSize` when not
   * supplied directly.
   *
   * @type {Sampler}
   */
  #sampler;

  /**
   * The strategy-pattern KS objective. Inferred from `scales` and
   * `weights` when not supplied directly.
   *
   * @type {KsObjective}
   */
  #objective;

  /**
   * The strategy-pattern optimizer instance.
   *
   * @type {Optimizer}
   */
  #optimizer;

  /**
   * Builds a Hurstify estimator with the given configuration.
   *
   * All parameters are optional; sensible defaults match the paper's
   * recommended settings for daily equity log-volatility. Pass an
   * explicit `iterations: 1` to disable variance reduction and a
   * non-null `blockSize` to enable paper-faithful block random
   * permutation.
   *
   * @param {Object} config Configuration options.
   * @param {number} config.scaleA1 Lower scale `a_1` used when `scales`
   *   is not provided (default 1).
   * @param {number} config.scaleA2 Upper scale `a_2` used when `scales`
   *   is not provided (default 50).
   * @param {Array<number>=} config.scales Multi-scale analysis array;
   *   overrides `scaleA1` / `scaleA2`.
   * @param {number} config.sampleSize Number of increments drawn per
   *   scale (default 500).
   * @param {number} config.iterations Variance-reduction iterations
   *   averaged by `estimate()` (default 16).
   * @param {Sampler=} config.sampler Custom `Sampler` strategy. Defaults
   *   to a `BlockPermutationSampler` when `blockSize > 0`, else a
   *   `ReservoirSampler`.
   * @param {KsObjective=} config.objective Custom `KsObjective` strategy.
   *   Defaults to `WeightedMultiScaleKsObjective` when `weights` is set
   *   with `scales.length > 2`, else `MultiScaleKsObjective` for plain
   *   multi-scale, else `PairwiseKsObjective`.
   * @param {Array<number>=} config.weights Per-scale weights used by the
   *   multi-scale weighted objective.
   * @param {string} config.optimizerType Key from the optimizer
   *   registry: `'brent' | 'nelder-mead' | 'annealing' | 'de' | 'ags'`.
   *   Defaults to `'brent'`.
   * @param {number=} config.blockSize Block length for block random
   *   permutation. `null` / missing disables permutation and falls back
   *   to plain sampling.
   * @param {number=} config.hMin Lower bound clamp applied to the
   *   returned `H` (default 0.01).
   * @param {number=} config.hMax Upper bound clamp applied to the
   *   returned `H` (default 0.99).
   */
  constructor(config = {}) {
    this.scaleA1 = config.scaleA1 !== undefined ? config.scaleA1 : 1;
    this.scaleA2 = config.scaleA2 !== undefined ? config.scaleA2 : 50;
    this.scales = config.scales || null;
    this.sampleSize = config.sampleSize !== undefined ? config.sampleSize : 500;
    this.iterations = config.iterations !== undefined ? config.iterations : 16;
    this.weights = config.weights || null;
    this.optimizerType = config.optimizerType || 'brent';
    this.blockSize = config.blockSize || null;
    this.hMin = config.hMin !== undefined ? config.hMin : 0.01;
    this.hMax = config.hMax !== undefined ? config.hMax : 0.99;
    this.validateConfig();

    this.#sampler =
      config.sampler instanceof Sampler
        ? config.sampler
        : defaultSampler(this.blockSize);
    this.#objective =
      config.objective instanceof KsObjective
        ? config.objective
        : chooseKsObjective(this.scales, this.weights);
    this.#optimizer =
      config.optimizer instanceof Optimizer
        ? config.optimizer
        : optimizerRegistry.resolveOr(
            config.optimizer || this.optimizerType,
            'brent',
          );
  }

  /**
   * Registers a custom `Optimizer` subclass factory in the global
   * registry. Use to plug in a proprietary search algorithm without
   * modifying the library source.
   *
   * @param {string} name Optimizer identifier.
   * @param {function(): Optimizer}
   *   factory Returning a fresh `Optimizer` instance.
   */
  static registerOptimizer(name, factory) {
    optimizerRegistry.register(name, factory);
  }

  /**
   * Validates the constructor configuration; throws a {@link HurstifyError}
   * with a precise error code on the first failure.
   */
  validateConfig() {
    if (!Number.isFinite(this.hMin) || !Number.isFinite(this.hMax)) {
      throw new HurstifyError(
        'hMin and hMax must be finite',
        'E_INVALID_BOUNDS',
      );
    }
    if (this.hMin >= this.hMax) {
      throw new HurstifyError(
        'hMin must be strictly less than hMax',
        'E_INVALID_BOUNDS',
      );
    }
    if (this.hMin <= 0 || this.hMax >= 1) {
      throw new HurstifyError(
        'hMin/hMax must lie in the open interval (0, 1)',
        'E_INVALID_BOUNDS',
      );
    }
    if (this.sampleSize <= 0) {
      throw new HurstifyError(
        'sampleSize must be positive',
        'E_INVALID_SAMPLE_SIZE',
      );
    }
    if (this.iterations <= 0) {
      throw new HurstifyError(
        'iterations must be positive',
        'E_INVALID_ITERATIONS',
      );
    }
    if (this.blockSize !== null && this.blockSize <= 0) {
      throw new HurstifyError(
        'blockSize must be positive when provided',
        'E_INVALID_BLOCK_SIZE',
      );
    }
    if (
      this.scales &&
      this.weights &&
      this.scales.length !== this.weights.length
    ) {
      throw new HurstifyError(
        'weights length must equal scales length',
        'E_WEIGHTS_MISMATCH',
      );
    }
  }

  /**
   * Computes the increments of a series at a single scale.
   *
   * For each index `i` returns `series[i + scale] - series[i]`. The
   * result has length `series.length - scale`. Inputs may be a regular
   * array or a `Float64Array`. The output is always a `Float64Array`.
   *
   * Complexity: O(n).
   *
   * @param {Array<number>|Float64Array} series Input series in
   *   chronological order.
   * @param {number} scale Non-negative lag `a > 0`.
   * @return {Float64Array} Increment array of length `series.length -
   *   scale`.
   */
  static getIncrements(series, scale) {
    const len = series.length;
    const result = new Float64Array(len - scale);
    for (let i = 0; i < len - scale; i++) {
      result[i] = series[i + scale] - series[i];
    }
    return result;
  }

  /**
   * Precomputes the increments for **every requested scale** in a
   * single logical pass.
   *
   * @param {Array<number>|Float64Array} series Input series.
   * @param {Array<number>} scales Scales to compute increments at.
   * @return {Map<number, Float64Array>} Map from scale to its increment
   *   array.
   */
  static getIncrementsMulti(series, scales) {
    const result = new Map();
    const len = series.length;
    for (const scale of scales) {
      const inc = new Float64Array(len - scale);
      for (let i = 0; i < len - scale; i++) {
        inc[i] = series[i + scale] - series[i];
      }
      result.set(scale, inc);
    }
    return result;
  }

  /**
   * Internal one-shot estimation that exposes its intermediate state.
   *
   * Returns the clamped `H`, the minimized KS distance, the prepared
   * sorted samples and the active scale vector. Failures throw a
   * {@link HurstifyError} with a precise error code.
   *
   * @param {Array<number>} window Data window in chronological order.
   * @param {Object} opts Per-call overrides. Supported keys mirror the
   *   constructor (except `optimizerType`, which is always reused).
   * @return {{H: number, minimizedD: number, sortedSamples:
   *   Array<Float64Array>, scaleValues: Array<number>}} Estimation
   *   result.
   */
  #estimateSingleRaw(window, opts = {}) {
    const scales = opts.scales || this.scales;
    return this.#estimateAt(
      window,
      scales,
      opts.weights || this.weights,
      opts.sampleSize || this.sampleSize,
    );
  }

  /**
   * Pure single-shot estimation: every input is passed in, no instance
   * state is read or mutated. Used by {@link rollingMultiScale} so the
   * estimator can be re-used concurrently without leaking
   * `scales` / `weights` / KS-objective mutations across calls.
   *
   * @param {Array<number>} window Path slice to estimate on.
   * @param {Array<number>} scales Resampling scales (lower = coarser).
   * @param {Array<number>} weights Per-scale weights (must align with `scales`).
   * @param {number} sampleSize Sample size for the KS permutation step.
   * @return {{H: number, minimizedD: number}} Estimate and minimized KS distance.
   */
  #estimateAt(window, scales, weights, sampleSize) {
    if (!window || window.length === 0) {
      throw new HurstifyError(
        'window must be a non-empty array',
        'E_EMPTY_WINDOW',
      );
    }
    if (scales && weights && scales.length !== weights.length) {
      throw new HurstifyError(
        'weights length must equal scales length',
        'E_WEIGHTS_MISMATCH',
      );
    }

    const sampler = this.#sampler;
    const objective = chooseKsObjective(scales || null, weights || null);
    const optimizer = this.#optimizer;
    const hMin = this.hMin;
    const hMax = this.hMax;

    let sortedSamples;
    let scaleValues;

    if (scales && scales.length > 0) {
      scaleValues = scales;
      const incMap = Hurstify.getIncrementsMulti(window, scales);
      sortedSamples = scales.map((scale) => {
        const inc = incMap.get(scale);
        return sampler
          .draw(inc, sampleSize)
          .slice()
          .sort((a, b) => a - b);
      });
    } else {
      scaleValues = [this.scaleA1, this.scaleA2];
      const inc1 = Hurstify.getIncrements(window, this.scaleA1);
      const inc2 = Hurstify.getIncrements(window, this.scaleA2);
      sortedSamples = [
        sampler
          .draw(inc1, sampleSize)
          .slice()
          .sort((a, b) => a - b),
        sampler
          .draw(inc2, sampleSize)
          .slice()
          .sort((a, b) => a - b),
      ];
    }

    const fn = (H) => objective.evaluate(sortedSamples, scaleValues, H);

    let rawH;
    try {
      rawH = optimizer.minimize(fn, hMin, hMax, 0.5);
    } catch (err) {
      throw new HurstifyError(
        `Optimizer convergence failed: ${err.message}`,
        'E_OPTIMIZER_FAILURE',
      );
    }
    if (!Number.isFinite(rawH)) {
      throw new HurstifyError(
        'Optimizer returned non-finite value',
        'E_OPTIMIZER_NONFINITE',
      );
    }
    const H = Math.max(hMin, Math.min(hMax, rawH));
    const minimizedD = fn(H);
    return {H, minimizedD, sortedSamples, scaleValues};
  }

  /**
   * Single-shot `H` estimate (no variance reduction).
   *
   * @param {Array<number>} window Data window.
   * @param {Object=} opts Per-call overrides (see constructor).
   * @return {number} Estimated Hurst parameter in `[hMin, hMax]`.
   * @throws {HurstifyError} When the window is empty or the optimizer
   *   fails.
   */
  estimateSingle(window, opts = {}) {
    return this.#estimateSingleRaw(window, opts).H;
  }

  /**
   * Public one-shot profile: same optimization as `estimateSingle` but
   * also returns the prepared sorted samples and active scale vector,
   * useful for building pairwise KS profiles and significance tests.
   *
   * @param {Array<number>} window Data window.
   * @param {Object=} opts Per-call overrides.
   * @return {{H: number, minimizedD: number, sortedSamples:
   *   Array<Float64Array>, scaleValues: Array<number>}} Estimation
   *   profile.
   */
  profile(window, opts = {}) {
    return this.#estimateSingleRaw(window, opts);
  }

  /**
   * Single-shot `H` estimate that also reports the minimized KS
   * distance.
   *
   * @param {Array<number>} window Data window.
   * @param {Object=} opts Per-call overrides (see constructor).
   * @return {{H: number, minimizedD: number}} Estimate + minimized KS
   *   distance.
   */
  estimateSingleWithDiagnostics(window, opts = {}) {
    const {H, minimizedD} = this.#estimateSingleRaw(window, opts);
    return {H, minimizedD};
  }

  /**
   * Variance-reduced estimate: averages `iterations` independent
   * single-shot estimates. Returns the mean of the successful
   * iterations and logs the failed ones through the leveled logger.
   *
   * @param {Array<number>} window Data window.
   * @param {Object=} opts Per-call overrides.
   * @param {number=} opts.iterations Override the configured
   *   `iterations`.
   * @return {number} Mean of successful per-iteration estimates.
   * @throws {HurstifyError} When `iterations <= 0` or all iterations
   *   fail.
   */
  estimate(window, opts = {}) {
    let sum = 0;
    let valid = 0;
    const k = (opts && opts.iterations) || this.iterations;
    if (k <= 0)
      throw new HurstifyError('iterations must be > 0', 'E_INVALID_ITERATIONS');
    for (let i = 0; i < k; i++) {
      try {
        sum += this.estimateSingle(window, opts);
        valid++;
      } catch (err) {
        warn('estimate iteration failed', err.message);
      }
    }
    if (valid === 0) {
      throw new HurstifyError(
        'All optimization iterations failed',
        'E_ALL_ITERATIONS_FAILED',
      );
    }
    return sum / valid;
  }

  /**
   * Sliding-window estimation along a long series.
   *
   * For each anchor `t` the method slices `series[t : t + windowSize]`
   * and runs `estimate()` on the slice. Failures are captured into the
   * result as `{t, H: null, error}` instead of aborting the loop.
   *
   * @param {Array<number>} series Time series in chronological order.
   * @param {number} windowSize Window length in samples.
   * @param {number} step Stride between consecutive windows (default
   *   `1`).
   * @param {function(number): void=} onProgress Optional progress
   *   callback receiving the ratio of completed windows in `[0, 1]`.
   * @return {Array<{t: number, H: ?number, error: ?string}>} Rolling
   *   estimates.
   * @throws {HurstifyError} When `step <= 0`.
   */
  rolling(series, windowSize, step = 1, onProgress) {
    if (series.length < windowSize) return [];
    if (step <= 0)
      throw new HurstifyError('step must be > 0', 'E_INVALID_STEP');
    const results = [];
    const total = Math.floor((series.length - windowSize) / step) + 1;
    let count = 0;

    for (let t = 0; t <= series.length - windowSize; t += step) {
      const window = series.slice(t, t + windowSize);
      try {
        const H = this.estimate(window);
        results.push({t, H});
      } catch (err) {
        warn(`Rolling window at t=${t} failed`, err.message);
        results.push({t, H: null, error: err.message});
      }
      count++;
      if (onProgress) onProgress(count / total);
    }
    return results;
  }

  /**
   * Multi-scale rolling estimation that exposes the KS profile per
   * window.
   *
   * For each anchor `t` the method performs a **one-shot** multi-scale
   * estimate (no variance reduction — this method favors throughput
   * over stability) and additionally returns the flat `profile` of
   * pairwise KS distances at the optimal `H`.
   *
   * @param {Array<number>} series Time series in chronological order.
   * @param {number} windowSize Window length in samples.
   * @param {Array<number>} scales Multi-scale analysis array used for
   *   both estimation and profile computation.
   * @param {Array<number>=} weights Optional per-scale weights for the
   *   weighted KS objective.
   * @param {number} step Stride between consecutive windows (default
   *   `1`).
   * @param {function(number): void=} onProgress Optional progress
   *   callback.
   * @return {Array<{t: number, H: ?number, profile: Array<number>, error:
   * ?string}>} Rolling estimates with KS profiles.
   * @throws {HurstifyError} When `step <= 0`.
   */
  rollingMultiScale(
    series,
    windowSize,
    scales,
    weights = null,
    step = 1,
    onProgress,
  ) {
    if (series.length < windowSize) return [];
    if (step <= 0)
      throw new HurstifyError('step must be > 0', 'E_INVALID_STEP');

    const results = [];
    const total = Math.floor((series.length - windowSize) / step) + 1;
    let count = 0;

    for (let t = 0; t <= series.length - windowSize; t += step) {
      const window = series.slice(t, t + windowSize);
      try {
        const {H, sortedSamples} = this.#estimateAt(
          window,
          scales,
          weights,
          this.sampleSize,
        );
        const profile = buildScaleProfile(sortedSamples, scales, H);
        results.push({t, H, profile});
      } catch (err) {
        warn(`Multi-scale rolling window at t=${t} failed`, err.message);
        results.push({t, H: null, profile: [], error: err.message});
      }
      count++;
      if (onProgress) onProgress(count / total);
    }
    return results;
  }

  /**
   * Batch estimation across an array of non-overlapping windows.
   *
   * Each window is processed independently via
   * {@link Hurstify#estimateSingle} (no variance reduction — variance
   * reduction is left to the caller for fine-grained control over
   * per-window effort).
   *
   * @param {Array<Array<number>>} windows Array of windows.
   * @return {Array<{H: ?number, error: ?string}>} Per-window estimates
   *   with an `error` field set when estimation failed.
   */
  estimateBatch(windows) {
    return windows.map((window, idx) => {
      try {
        const H = this.estimateSingle(window);
        return {H, error: null};
      } catch (err) {
        error(`Batch window ${idx} failed`, err.message);
        return {H: null, error: err.message};
      }
    });
  }
}

/**
 * Builds a flat "profile" of all pairwise KS distances at a fixed `H`.
 *
 * Given `K` sorted samples, the profile has `K * (K - 1) / 2` entries
 * corresponding to every unordered scale pair. Useful for diagnostics.
 *
 * @param {Array<Float64Array>} sortedSamples Pre-sorted samples.
 * @param {Array<number>} scales Scale values.
 * @param {number} H Hurst parameter.
 * @return {Array<number>} Flat array of pairwise KS distances.
 */
function buildScaleProfile(sortedSamples, scales, H) {
  const profile = [];
  for (let i = 0; i < sortedSamples.length; i++) {
    for (let j = i + 1; j < sortedSamples.length; j++) {
      profile.push(
        computeKsDistanceRescaled(
          sortedSamples[i],
          sortedSamples[j],
          Math.pow(scales[i], -H),
          Math.pow(scales[j], -H),
        ),
      );
    }
  }
  return profile;
}
