/**
 * @fileoverview Kernel strategy hierarchy for fractional integration.
 *
 * Replaces the ad-hoc fractional-kernel implementations scattered
 * across `stochastic-generators.js`, `models/rbergomi.js`, `models/fou.js`
 * and `models/mpre.js` with a single polymorphic interface:
 *
 * - {@link RiemannLiouvilleKernel} — the standard `K(t) = sqrt(2H) *
 *   t^{H - 0.5}` kernel used by rBergomi and exact-OU simulators.
 * - {@link TimeVaryingKernel} — kernel whose exponent `H` itself
 *   varies in time; consumed by `MultifractionalPreModel`.
 *
 * Subclasses implement {@link Kernel#evaluate}; the estimator /
 * simulator only ever invokes that one method.
 */

/**
 * Abstract base class for fractional-integration kernels.
 *
 * @abstract
 */
export class Kernel {
  /**
   * Evaluates the kernel at lag `t > 0`.
   *
   * @param {number} t Positive lag (units of `dt`).
   * @return {number} Kernel weight at `t`.
   * @abstract
   */
  evaluate(t) {
    throw new Error(
      `${this.constructor.name}.evaluate(${t}) is not implemented`,
    );
  }

  /**
   * Precomputes the kernel over `nSteps` time steps at stride `dt`.
   *
   * @param {number} nSteps Number of time steps.
   * @param {number} dt Per-step time increment.
   * @return {Float64Array} Cached kernel values.
   */
  precompute(nSteps, dt) {
    const out = new Float64Array(nSteps);
    for (let i = 0; i < nSteps; i++) {
      out[i] = this.evaluate((i + 1) * dt);
    }
    return out;
  }
}

/**
 * Riemann–Liouville kernel `K(t) = sqrt(2 H) * t^{H - 0.5}` for
 * `H in (0, 1)` and `t > 0`.
 *
 * This is the kernel of choice for rBergomi and the exact-OU / mPRE
 * simulators.
 */
export class RiemannLiouvilleKernel extends Kernel {
  /**
   * @param {number} H Hurst parameter (must satisfy `0 < H < 1`).
   */
  constructor(H) {
    super();
    if (!Number.isFinite(H) || H <= 0 || H >= 1) {
      throw new Error('RiemannLiouvilleKernel: H must satisfy 0 < H < 1');
    }
    this.H = H;
    this.coefficient = Math.sqrt(2 * H);
  }

  /** @override */
  evaluate(t) {
    return this.coefficient * Math.pow(t, this.H - 0.5);
  }
}

/**
 * Time-varying kernel whose local exponent `H(t)` is sampled at every
 * step. The kernel evaluator picks the exponent based on `t`:
 *
 *     K(t) = sqrt(2 * H(t)) * t^{H(t) - 0.5}
 *
 * The caller supplies a `hPath` array whose `i`-th entry is the local
 * Hurst exponent at time `i * dt`. When `H(t)` is constant the kernel
 * collapses to the Riemann–Liouville form.
 *
 * @param {Array<number>|Float64Array} hPath Per-step local Hurst values.
 * @param {number} dt Per-step time increment.
 */
export class TimeVaryingKernel extends Kernel {
  /**
   * @param {Array<number>|Float64Array} hPath Per-step local H values.
   * @param {number} dt Per-step time increment (default `1`).
   */
  constructor(hPath, dt = 1) {
    super();
    if (!hPath || hPath.length === 0) {
      throw new Error('TimeVaryingKernel: hPath must be a non-empty array');
    }
    if (!Number.isFinite(dt) || dt <= 0) {
      throw new Error('TimeVaryingKernel: dt must be positive');
    }
    this.hPath = hPath;
    this.dt = dt;
  }

  /** @override */
  evaluate(t) {
    const idx = Math.max(
      0,
      Math.min(this.hPath.length - 1, Math.floor(t / this.dt) - 1),
    );
    const H = this.hPath[idx];
    return Math.sqrt(2 * H) * Math.pow(t, H - 0.5);
  }
}
