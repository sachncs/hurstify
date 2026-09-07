/**
 * @fileoverview Sampler strategy hierarchy for the Hurstify estimator.
 *
 * Samplers consume the raw increment array at a given scale and return a
 * sub-sample of size `n`. They encapsulate the variance-reduction step
 * (see `Hurstify.estimate`) and let callers plug in paper-faithful
 * block random permutation without modifying the estimator itself.
 *
 * The concrete subclasses are:
 *
 * - {@link ReservoirSampler} — Floyd's Algorithm R reservoir sampler.
 * - {@link BlockPermutationSampler} — random block permutation followed
 *   by a reservoir draw. This is the paper-faithful RK-SAVR pipeline.
 * - {@link IdentitySampler} — returns the input unchanged. Useful in
 *   tests and for callers who pre-size their inputs to `n`.
 *
 * Subclasses implement {@link Sampler#draw}; everything else is shared.
 */

import {getRandomSample} from '../stats.js';
import {permuteBlocks} from '../stats.js';

/**
 * Abstract base class for sampling strategies.
 *
 * A `Sampler` is a *strategy*: callers obtain a fresh instance and
 * invoke `draw(inc, n)` once per variance-reduction iteration. The
 * estimator never holds sampler state across calls so strategies can be
 * safely shared across estimator instances.
 *
 * @abstract
 */
export class Sampler {
  /**
   * Draws a sub-sample of size `n` from `inc`.
   *
   * @param {Array<number>|Float64Array} inc Increment array at a single
   *   scale.
   * @param {number} n Desired sample size.
   * @return {Array<number>} Sampled sub-array.
   * @abstract
   */
  draw(inc, n) {
    throw new Error(
      `${this.constructor.name}.draw(inc[${inc.length}], ${n}) is not implemented`,
    );
  }
}

/**
 * Floyd's Algorithm R reservoir sampler wrapped as a `Sampler` strategy.
 *
 * Complexity: `O(inc.length)` time, `O(n)` extra memory. Reproducible
 * when `prng.setRandomSeed()` has been called.
 */
export class ReservoirSampler extends Sampler {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  draw(inc, n) {
    return getRandomSample(inc, n);
  }
}

/**
 * Block random permutation followed by a reservoir draw.
 *
 * This is the paper-faithful RK-SAVR pipeline: the increments are first
 * sliced into blocks of length `blockSize` (optionally with a random
 * phase offset) and the blocks are shuffled, then the desired number of
 * increments is drawn without replacement from the permuted array.
 *
 * @see permuteBlocks
 */
export class BlockPermutationSampler extends Sampler {
  /**
   * @param {number} blockSize Block length. Must be positive and not
   *   exceed `inc.length` at draw time.
   * @param {boolean=} randomPhase When `true` apply a uniform
   *   `[0, blockSize)` phase offset before permuting (default `true`).
   */
  constructor(blockSize, randomPhase = true) {
    super();
    if (!Number.isFinite(blockSize) || blockSize <= 0) {
      throw new Error('blockSize must be a positive number');
    }
    this.blockSize = blockSize;
    this.randomPhase = randomPhase;
  }

  /** @override */
  draw(inc, n) {
    const permuted = permuteBlocks(inc, this.blockSize, this.randomPhase);
    return getRandomSample(permuted, n);
  }
}

/**
 * Identity sampler — returns the input unchanged.
 *
 * Useful when the caller has already prepared an array of exactly `n`
 * elements (e.g. in deterministic unit tests).
 */
export class IdentitySampler extends Sampler {
  /**
   * @param {Object=} opts Reserved for future use.
   */
  constructor(opts = {}) {
    super();
    this.opts = opts;
  }

  /** @override */
  draw(inc, n) {
    const out = Array.isArray(inc)
      ? inc.slice(0, n)
      : Array.from(inc).slice(0, n);
    return out;
  }
}

/**
 * Convenience: selects the default sampler based on `blockSize`.
 *
 * - When `blockSize` is a positive number a `BlockPermutationSampler`
 *   is returned.
 * - Otherwise a `ReservoirSampler` is returned.
 *
 * @param {number=} blockSize Block length for the permutation sampler;
 *   omit (or pass `0`/negative) to get the reservoir sampler instead.
 * @return {Sampler} Either a `BlockPermutationSampler` or a
 *   `ReservoirSampler`.
 */
export function defaultSampler(blockSize) {
  if (blockSize && blockSize > 0) {
    return new BlockPermutationSampler(blockSize);
  }
  return new ReservoirSampler();
}
