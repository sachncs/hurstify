/**
 * @fileoverview Statistical inference facade for hurstify.
 *
 * Re-exports the focused submodule APIs. Hypothesis tests live in the
 * {@link HypothesisTest} strategy hierarchy under
 * `lib/strategies/hypothesis-test.js` — consumers instantiate the
 * strategy class directly (e.g. `new KsSignificanceTest().run(...)`).
 *
 * The module depends on the seeded `nextRandom()` dispatcher in
 * `prng.js`, so bootstrap samples are reproducible across runs.
 *
 * @see ./inference/asymptotic.js for the analytical-variance helpers.
 * @see ./inference/filtering.js for the Kalman filter.
 * @see ../strategies/hypothesis-test.js for the polymorphic
 * `HypothesisTest` strategy hierarchy.
 */

export {
  getAsymptoticVariance,
  getStandardError,
  getConfidenceInterval,
} from './inference/asymptotic.js';

export {runKalmanFilter} from './inference/filtering.js';

export {
  ksCriticalValue,
  ksPvalue,
  KsSignificanceTest,
  ConstancyTest,
  CusumBreakTest,
  BootstrapConfidenceInterval,
  detectCusumBreakpoints,
} from './strategies/hypothesis-test.js';
