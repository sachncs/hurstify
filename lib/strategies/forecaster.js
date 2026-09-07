/**
 * @fileoverview Forecaster strategy hierarchy.
 *
 * Replaces the inconsistent forecaster API surface
 * (`createArfimaForecaster`, `runHoltWintersForecast`, `createLstmForecaster`,
 * `createAttentionForecaster`) with a single polymorphic `Forecaster` base
 * class.
 *
 * - {@link ArfimaForecaster}: autoregressive fractionally-integrated
 *   moving average.
 * - {@link HoltWintersForecaster}: exponential smoothing (level + trend).
 * - {@link LstmForecaster}: stateless LSTM-like recurrent cell.
 * - {@link AttentionForecaster}: stateless single-head attention block.
 *
 * All forecasters expose `predict(history)` as the primary entry point;
 * `forecast(history)` is a thin alias kept for backward compatibility
 * with the old free-function names.
 */

import {nextRandom} from '../prng.js';

/**
 * Abstract base class for H-series forecasters.
 *
 * @abstract
 */
export class Forecaster {
  /**
   * Predicts the next `H` value from the supplied history.
   *
   * @param {Array<number>} history Time-ordered `H` estimates.
   * @return {number} Predicted `H`.
   * @abstract
   */
  predict(history) {
    throw new Error(
      `${this.constructor.name}.predict(history[${history.length}]) is not implemented`,
    );
  }

  /**
   * Alias for {@link Forecaster#predict}.
   *
   * @param {Array<number>} history Time-ordered `H` estimates.
   * @return {number} Predicted `H`.
   */
  forecast(history) {
    return this.predict(history);
  }
}

/**
 * ARFIMA(p, d, q) forecaster.
 *
 * @param {Object} opts Model parameters.
 * @param {number=} opts.p AR order (default `1`).
 * @param {number=} opts.d Differencing parameter (default `0.3`).
 * @param {number=} opts.q MA order (default `1`).
 * @param {number=} opts.window Window size for rolling forecasts
 *   (default `100`).
 */
export class ArfimaForecaster extends Forecaster {
  constructor(opts = {}) {
    super();
    this.p = opts.p !== undefined ? opts.p : 1;
    this.d = opts.d !== undefined ? opts.d : 0.3;
    this.q = opts.q !== undefined ? opts.q : 1;
    this.windowSize = opts.window !== undefined ? opts.window : 100;
  }

  /** @override */
  predict(hHistory) {
    const n = hHistory.length;
    if (n < this.windowSize) {
      return hHistory.reduce((a, b) => a + b, 0) / n;
    }
    const recent = hHistory.slice(n - this.windowSize);
    const diffSeries = fractionalDifference(recent, this.d);
    const diffLen = diffSeries.length;
    let prediction = 0;
    for (let i = 0; i < Math.min(this.p, 3); i++) {
      const idx = diffLen - 1 - i;
      if (idx >= 0 && idx < diffLen) {
        prediction += 0.3 * diffSeries[idx];
      }
    }
    for (let i = 0; i < Math.min(this.q, 3); i++) {
      const idx = diffLen - 1 - i;
      if (idx >= 0 && idx < diffLen) {
        prediction += 0.1 * (recent[idx] - prediction);
      }
    }
    return Math.max(0.01, Math.min(0.99, prediction));
  }
}

/**
 * Holt-Winters (level + trend) forecaster.
 *
 * @param {Object} opts Smoothing parameters.
 * @param {number=} opts.alpha Level smoothing factor (default `0.3`).
 * @param {number=} opts.beta Trend smoothing factor (default `0.1`).
 */
export class HoltWintersForecaster extends Forecaster {
  constructor(opts = {}) {
    super();
    this.alpha = opts.alpha !== undefined ? opts.alpha : 0.3;
    this.beta = opts.beta !== undefined ? opts.beta : 0.1;
  }

  /** @override */
  predict(series) {
    if (!series || series.length === 0) {
      throw new Error('HoltWintersForecaster: series must be non-empty');
    }
    if (this.alpha < 0 || this.alpha > 1) {
      throw new Error('HoltWintersForecaster: alpha must be in [0, 1]');
    }
    if (this.beta < 0 || this.beta > 1) {
      throw new Error('HoltWintersForecaster: beta must be in [0, 1]');
    }
    let level = series[0];
    let trend = series.length > 1 ? series[1] - series[0] : 0;
    for (let i = 1; i < series.length; i++) {
      const value = series[i];
      const newLevel = this.alpha * value + (1 - this.alpha) * (level + trend);
      const newTrend = this.beta * (newLevel - level) + (1 - this.beta) * trend;
      level = newLevel;
      trend = newTrend;
    }
    return level + trend;
  }
}

/**
 * Xavier (Glorot-uniform) weight initialization.
 *
 * Produces a `rows x cols` matrix where each entry is sampled uniformly
 * in `[-scale, scale]` with `scale = sqrt(2 / (rows + cols))`. This is the
 * standard initializer for tanh/sigmoid-activated layers (Glorot &
 * Bengio, 2010).
 *
 * @param {number} rows Number of rows.
 * @param {number} cols Number of columns.
 * @return {Array<Array<number>>} Initialized weight matrix.
 */
function xavierInit(rows, cols) {
  const scale = Math.sqrt(2.0 / (rows + cols));
  const arr = new Array(rows);
  for (let i = 0; i < rows; i++) {
    arr[i] = new Array(cols);
    for (let j = 0; j < cols; j++) {
      arr[i][j] = (nextRandom() * 2 - 1) * scale;
    }
  }
  return arr;
}

/**
 * Stateless LSTM-like recurrent cell forecaster.
 *
 * @param {Object} opts Architecture options.
 * @param {number=} opts.hiddenSize Hidden state dimension (default `16`).
 * @param {number=} opts.inputSize Input dimension (default `1`).
 */
export class LstmForecaster extends Forecaster {
  constructor(opts = {}) {
    super();
    this.hiddenSize = opts.hiddenSize !== undefined ? opts.hiddenSize : 16;
    this.inputSize = opts.inputSize !== undefined ? opts.inputSize : 1;
    this.Wf = xavierInit(this.hiddenSize, this.inputSize + this.hiddenSize);
    this.Wi = xavierInit(this.hiddenSize, this.inputSize + this.hiddenSize);
    this.Wc = xavierInit(this.hiddenSize, this.inputSize + this.hiddenSize);
    this.Wo = xavierInit(this.hiddenSize, this.inputSize + this.hiddenSize);
    this.bf = new Array(this.hiddenSize).fill(0);
    this.bi = new Array(this.hiddenSize).fill(0);
    this.bc = new Array(this.hiddenSize).fill(0);
    this.bo = new Array(this.hiddenSize).fill(0);
  }

  /**
   * Runs a single recurrent step.
   *
   * @param {number} x Input scalar.
   * @param {Array<number>} hPrev Previous hidden state.
   * @param {Array<number>} cPrev Previous cell state.
   * @return {{h: Array<number>, c: Array<number>}} Updated hidden / cell.
   */
  step(x, hPrev, cPrev) {
    const concat = [x, ...hPrev];
    const f = new Array(this.hiddenSize);
    const iGate = new Array(this.hiddenSize);
    const cTilde = new Array(this.hiddenSize);
    const o = new Array(this.hiddenSize);
    for (let j = 0; j < this.hiddenSize; j++) {
      let sumF = this.bf[j];
      let sumI = this.bi[j];
      let sumC = this.bc[j];
      let sumO = this.bo[j];
      for (let k = 0; k < concat.length; k++) {
        sumF += this.Wf[j][k] * concat[k];
        sumI += this.Wi[j][k] * concat[k];
        sumC += this.Wc[j][k] * concat[k];
        sumO += this.Wo[j][k] * concat[k];
      }
      f[j] = 1 / (1 + Math.exp(-sumF));
      iGate[j] = 1 / (1 + Math.exp(-sumI));
      cTilde[j] = Math.tanh(sumC);
      o[j] = 1 / (1 + Math.exp(-sumO));
    }
    const c = new Array(this.hiddenSize);
    const h = new Array(this.hiddenSize);
    for (let j = 0; j < this.hiddenSize; j++) {
      c[j] = f[j] * cPrev[j] + iGate[j] * cTilde[j];
      h[j] = o[j] * Math.tanh(c[j]);
    }
    return {h, c};
  }

  /** @override */
  predict(series) {
    if (!series || series.length === 0) {
      throw new Error('LstmForecaster: series must be non-empty');
    }
    let h = new Array(this.hiddenSize).fill(0);
    let c = new Array(this.hiddenSize).fill(0);
    for (const x of series) {
      const result = this.step(x, h, c);
      h = result.h;
      c = result.c;
    }
    return h[0];
  }
}

/**
 * Stateless single-head self-attention block forecaster.
 *
 * @param {Object} opts Architecture options.
 * @param {number=} opts.hiddenSize Hidden dimension (default `16`).
 */
export class AttentionForecaster extends Forecaster {
  constructor(opts = {}) {
    super();
    this.hiddenSize = opts.hiddenSize !== undefined ? opts.hiddenSize : 16;
    this.Wq = xavierInit(this.hiddenSize, this.hiddenSize);
    this.Wk = xavierInit(this.hiddenSize, this.hiddenSize);
    this.Wv = xavierInit(this.hiddenSize, this.hiddenSize);
    this.WoAttn = xavierInit(this.hiddenSize, this.hiddenSize);
  }

  /**
   * Computes a row-vector times matrix product.
   *
   * @param {Array<Array<number>>} mat M by N matrix.
   * @param {Array<number>} vec Length-N row vector.
   * @return {Array<number>} Length-M row vector.
   */
  matVecMul(mat, vec) {
    const result = new Array(mat.length);
    for (let i = 0; i < mat.length; i++) {
      let sum = 0;
      for (let j = 0; j < vec.length; j++) {
        sum += mat[i][j] * vec[j];
      }
      result[i] = sum;
    }
    return result;
  }

  /**
   * Computes the numerically stable softmax of a vector.
   *
   * @param {Array<number>} vec Input vector.
   * @return {Array<number>} Softmax of vec.
   */
  softmax(vec) {
    const maxVal = Math.max(...vec);
    const exps = vec.map((v) => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((v) => v / sum);
  }

  /** @override */
  predict(series) {
    if (!series || series.length === 0) {
      throw new Error('AttentionForecaster: series must be non-empty');
    }
    const projected = series.map((x) => {
      const vec = new Array(this.hiddenSize);
      for (let i = 0; i < this.hiddenSize; i++) {
        vec[i] = x * (i % 2 === 0 ? 1 : 0.1) + i * 0.01;
      }
      return vec;
    });
    const queries = projected.map((p) => this.matVecMul(this.Wq, p));
    const keys = projected.map((p) => this.matVecMul(this.Wk, p));
    const values = projected.map((p) => this.matVecMul(this.Wv, p));
    const n = projected.length;
    const output = new Array(this.hiddenSize).fill(0);
    for (let i = 0; i < n; i++) {
      const scores = new Array(n);
      for (let j = 0; j < n; j++) {
        let dot = 0;
        for (let d = 0; d < this.hiddenSize; d++) {
          dot += queries[i][d] * keys[j][d];
        }
        scores[j] = dot / Math.sqrt(this.hiddenSize);
      }
      const weights = this.softmax(scores);
      for (let j = 0; j < n; j++) {
        for (let d = 0; d < this.hiddenSize; d++) {
          output[d] += weights[j] * values[j][d];
        }
      }
    }
    const result = this.matVecMul(this.WoAttn, output);
    for (let i = 0; i < this.hiddenSize; i++) {
      result[i] /= n;
    }
    return result[0];
  }
}

const binomialCache = new Map();
const binomialCacheKeys = [];
const MAX_BINOMIAL_CACHE = 100;

/**
 * Returns the binomial coefficient sequence `[C(d, 0), ..., C(d, lag)]`.
 *
 * Uses a tiny FIFO cache keyed by `${d}:${lag}` so that identical
 * lookups within a rolling ARFIMA run are `O(1)`. When the cache is
 * full the oldest entry is evicted.
 *
 * @param {number} d Differencing parameter.
 * @param {number} lag Maximum lag (inclusive).
 * @return {Float64Array} Coefficient vector of length `lag + 1`.
 */
function getBinomialCoeffs(d, lag) {
  const key = `${d}:${lag}`;
  let coeffs = binomialCache.get(key);
  if (!coeffs) {
    coeffs = new Float64Array(lag + 1);
    coeffs[0] = 1;
    for (let k = 1; k <= lag; k++) {
      coeffs[k] = (coeffs[k - 1] * (d - k + 1)) / k;
    }
    if (
      binomialCache.size >= MAX_BINOMIAL_CACHE &&
      binomialCacheKeys.length > 0
    ) {
      const oldest = binomialCacheKeys.shift();
      binomialCache.delete(oldest);
    }
    binomialCache.set(key, coeffs);
    binomialCacheKeys.push(key);
  }
  return coeffs;
}

/**
 * Computes the (truncated) fractional difference of a series for a given
 * `d` and lag cap. The truncation to `lag` keeps the per-step cost
 * `O(lag)` rather than `O(t)`, which is essential for long-history
 * forecasting.
 *
 * @param {Array<number>} data Input series.
 * @param {number} d Differencing parameter.
 * @param {number=} lag Maximum lag for the binomial expansion (default
 *   `50`).
 * @return {Array<number>} Fractionally differenced series.
 */
function fractionalDifference(data, d, lag = 50) {
  const n = data.length;
  const result = new Array(n);
  const coeffs = getBinomialCoeffs(d, lag);
  for (let t = 0; t < n; t++) {
    let sum = 0;
    let sign = 1;
    for (let k = 0; k <= Math.min(t, lag); k++) {
      sum += sign * coeffs[k] * data[t - k];
      sign = -sign;
    }
    result[t] = sum;
  }
  return result;
}
