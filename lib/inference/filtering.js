/**
 * @fileoverview Filtering utilities for H(t) series.
 *
 * Provides:
 *
 * - `runKalmanFilter`: a one-dimensional Kalman filter that smooths a
 *   series of `H` estimates under a simple random-walk state-space
 *   model.
 *
 * The state-space model assumed throughout is
 *
 *     x_t = x_{t-1} + w_t,  w_t ~ N(0, q)
 *     z_t = x_t + v_t,      v_t ~ N(0, r)
 *
 * where `x_t` is the latent Hurst exponent at time `t` and `z_t` is the
 * estimated value. The process-noise variance `q` and the observation-
 * noise variance `r` are user-specified.
 *
 * The likelihood-ratio constancy test now lives as the
 * {@link ConstancyTest} strategy in
 * `lib/strategies/hypothesis-test.js`.
 */

/**
 * One-dimensional Kalman filter for H(t) smoothing.
 *
 * State: `x_t = H_t`. Transition: `H_t = H_{t-1} + w_t`, `w_t ~ N(0, q)`.
 * Observation: `z_t = H_t + v_t`, `v_t ~ N(0, r)`.
 *
 * The filter is seeded with the first observation (`x_0 = z_0`) and a
 * unit prior covariance. Each subsequent step performs:
 *
 * 1. **Predict:** `xPred = x`, `pPred = p + q`.
 * 2. **Update:** `K = pPred / (pPred + r)`, `x = xPred + K * (z - xPred)`,
 *    `p = (1 - K) * pPred`.
 *
 * The result captures both the one-step-ahead predictions (before
 * incorporating the observation) and the filtered states (after).
 *
 * @param {Array<number>} observations Time-ordered `H` estimates.
 * @param {Object} opts Filter options.
 * @param {number=} opts.q Process noise variance (default `0.01`).
 * @param {number=} opts.r Measurement noise variance (default `0.1`).
 * @return {{filtered: Array<number>, predictions: Array<number>}}
 *   Filtered and one-step-predicted states, each of length `n`.
 */
export function runKalmanFilter(observations, opts = {}) {
  const q = opts.q || 0.01;
  const r = opts.r || 0.1;

  const n = observations.length;
  const filtered = new Array(n);
  const predictions = new Array(n);

  let x = observations[0];
  let p = 1.0;

  for (let i = 0; i < n; i++) {
    if (i > 0) {
      const xPred = x;
      const pPred = p + q;
      predictions[i] = xPred;

      const z = observations[i];
      const k = pPred / (pPred + r);
      x = xPred + k * (z - xPred);
      p = (1 - k) * pPred;
    } else {
      predictions[i] = x;
    }
    filtered[i] = x;
  }

  return {filtered, predictions};
}
