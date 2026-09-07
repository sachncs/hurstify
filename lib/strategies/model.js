/**
 * @fileoverview Stochastic-model strategy hierarchy.
 *
 * Normalizes the rough-volatility model zoo under a single
 * `StochasticModel` base class. Every concrete simulator
 * (rBergomi, rFSV, fOU, mPRE) now exposes the same `simulate(opts)`
 * entry point returning a uniform `SimulationResult`, plus a `price()`
 * entry point where the model admits an analytical price SDE.
 *
 * - {@link RoughBergomiModel}
 * - {@link RoughFsvModel}
 * - {@link FractionalOuModel} (abstract base)
 *   - {@link EulerMaruyamaFractionalOuModel} (default)
 *   - {@link ExactFractionalOuModel} (Riemann-Liouville integral)
 * - {@link MultifractionalPreModel} (abstract base)
 *   - {@link LocalHolderMultifractionalPreModel} (default)
 *   - {@link ExactMultifractionalPreModel} (time-varying kernel)
 *
 * The choice between Euler / exact is made at the ctor (subclass
 * selection), not via a `opts.discretization` branch.
 */

import {
  nextGaussian,
  generateFractionalNoise,
  generateCorrelatedGaussian,
} from '../stochastic-generators.js';
import {RiemannLiouvilleKernel} from './kernel.js';

/**
 * @typedef {{
 *   paths: Array<Float64Array>,
 *   times: Array<number>,
 *   brownians: Array<Float64Array>
 * }} SimulationResult
 */

/**
 * @typedef {{
 *   prices: Array<Float64Array>,
 *   volatilities: Array<Float64Array>,
 *   times: Array<number>
 * }} PriceResult
 */

/**
 * Abstract base class for stochastic-process simulators.
 *
 * @abstract
 */
export class StochasticModel {
  /**
   * Simulates `nPaths` paths of the underlying stochastic process.
   *
   * @param {Object} opts Model-specific options.
   * @return {SimulationResult} Simulated paths + time grid.
   * @abstract
   */
  simulate(opts = {}) {
    throw new Error(
      `${this.constructor.name}.simulate(${JSON.stringify(opts)}) is not implemented`,
    );
  }

  /**
   * Optionally drives a price SDE using the simulator's noise
   * realization. Default: throws — only models with a price SDE
   * implement this method.
   *
   * @param {SimulationResult} sim Output of {@link simulate}.
   * @param {Object} opts Price-SDE options.
   * @return {PriceResult} Simulated prices.
   */
  price(sim, opts = {}) {
    throw new Error(
      `${this.constructor.name}.price(sim[${sim.paths.length}], ${JSON.stringify(opts)}) is not implemented`,
    );
  }
}

/**
 * Rough Bergomi model.
 *
 *     dV_t / V_t = eta * dW^perp_t
 *     I_t = int_0^t sqrt(2H) (t - s)^{H - 0.5} dW^perp_s
 *     V_t = xi * exp(eta I_t - (eta^2 / 2) t^{2H})
 */
export class RoughBergomiModel extends StochasticModel {
  simulate(opts = {}) {
    const nPaths = opts.nPaths || 1;
    const nSteps = opts.nSteps || 252;
    const xi = opts.xi !== undefined ? opts.xi : 0.04;
    const eta = opts.eta !== undefined ? opts.eta : 2.0;
    const rho = opts.rho !== undefined ? opts.rho : -0.8;
    const H = opts.h !== undefined ? opts.h : 0.1;
    const T = opts.T !== undefined ? opts.T : 1.0;
    const dt = T / nSteps;
    const kernel = new RiemannLiouvilleKernel(H).precompute(nSteps, dt);
    const times = new Array(nSteps + 1);
    times[0] = 0;
    for (let t = 1; t <= nSteps; t++) times[t] = t * dt;
    const driftFactor = ((eta * eta) / 2) * Math.pow(dt, 2 * H);
    const paths = [];
    const brownians = [];
    for (let p = 0; p < nPaths; p++) {
      const path = new Float64Array(nSteps + 1);
      path[0] = xi;
      const [dW, dWperp] = generateCorrelatedGaussian(nSteps, rho);
      const dWperpSqrt = new Float64Array(nSteps);
      for (let t = 0; t < nSteps; t++) {
        dWperpSqrt[t] = dWperp[t] * Math.sqrt(dt);
      }
      const I = new Float64Array(nSteps + 1);
      I[0] = 0;
      for (let t = 1; t <= nSteps; t++) {
        let sum = 0;
        for (let j = 0; j < t; j++) {
          sum += kernel[t - 1 - j] * dWperp[j];
        }
        I[t] = sum;
      }
      for (let t = 1; t <= nSteps; t++) {
        const vt =
          xi * Math.exp(eta * I[t] - driftFactor * Math.pow(t * dt, 2 * H));
        path[t] = Math.max(0, vt);
      }
      paths.push(path);
      brownians.push(dW);
    }
    return {paths, times, brownians};
  }

  price(sim, opts = {}) {
    const mu = opts.mu !== undefined ? opts.mu : 0;
    const s0 = opts.s0 !== undefined ? opts.s0 : 100;
    const nSteps = sim.times.length - 1;
    const T = sim.times[sim.length - 1];
    const dt = T / nSteps;
    const prices = [];
    const volatilities = [];
    for (let p = 0; p < sim.paths.length; p++) {
      const volPath = sim.paths[p];
      const dW = sim.brownians[p];
      const pricePath = new Float64Array(nSteps + 1);
      pricePath[0] = s0;
      for (let t = 0; t < nSteps; t++) {
        const vol = Math.sqrt(volPath[t + 1]);
        pricePath[t + 1] =
          pricePath[t] * Math.exp(mu * dt + vol * dW[t] * Math.sqrt(dt));
      }
      prices.push(pricePath);
      volatilities.push(volPath);
    }
    return {prices, volatilities, times: sim.times};
  }
}

/**
 * Rough Fractional Stochastic Volatility model.
 *
 *     dV_t = theta (mu - V_t) dt + nu V_t^alpha dW^V_t + roughComp
 */
export class RoughFsvModel extends StochasticModel {
  simulate(opts = {}) {
    const nSteps = opts.nSteps || 252;
    const T = opts.T !== undefined ? opts.T : 1.0;
    const dt = T / nSteps;
    const H = opts.h !== undefined ? opts.h : 0.1;
    const theta = opts.theta !== undefined ? opts.theta : 2.0;
    const mu = opts.mu !== undefined ? opts.mu : 0.04;
    const nu = opts.nu !== undefined ? opts.nu : 0.5;
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.5;
    const v0 = opts.v0 !== undefined ? opts.v0 : 0.04;
    const kernel = new RiemannLiouvilleKernel(H).precompute(nSteps, dt);
    const times = new Array(nSteps + 1);
    times[0] = 0;
    for (let t = 1; t <= nSteps; t++) times[t] = t * dt;
    const volPath = new Float64Array(nSteps + 1);
    volPath[0] = v0;
    const fGn = generateFractionalNoise(nSteps + 1, H);
    for (let t = 1; t <= nSteps; t++) {
      const prev = volPath[t - 1];
      const volDrift = theta * (mu - prev) * dt;
      const volDiff =
        nu * Math.pow(prev, alpha) * Math.sqrt(dt) * nextGaussian();
      let roughComp = 0;
      for (let j = 0; j < t; j++) {
        roughComp += kernel[t - 1 - j] * fGn[j];
      }
      roughComp *= Math.sqrt(dt);
      volPath[t] = Math.max(
        1e-6,
        prev + volDrift + volDiff + roughComp * nu * 0.1,
      );
    }
    return {paths: [volPath], times, brownians: []};
  }

  price(sim, opts = {}) {
    const nSteps = sim.times.length - 1;
    const T = sim.times[sim.length - 1];
    const dt = T / nSteps;
    const s0 = opts.s0 !== undefined ? opts.s0 : 100;
    const drift = opts.drift !== undefined ? opts.drift : 0;
    const volPath = sim.paths[0];
    const prices = new Float64Array(nSteps + 1);
    prices[0] = s0;
    for (let t = 0; t < nSteps; t++) {
      const vol = Math.sqrt(volPath[t + 1]);
      const z = nextGaussian();
      const ds = vol * prices[t] * (drift * dt + z * Math.sqrt(dt));
      prices[t + 1] = prices[t] + ds;
    }
    return {prices: [prices], volatilities: [volPath], times: sim.times};
  }
}

/**
 * Abstract base class for the Fractional Ornstein-Uhlenbeck model.
 *
 *     dX_t = theta (mu - X_t) dt + sigma dB^H_t
 *
 * Concrete subclasses pick the discretization scheme:
 * - {@link EulerMaruyamaFractionalOuModel} — default, cheap
 * - {@link ExactFractionalOuModel} — Riemann-Liouville integral, accurate
 *
 * @abstract
 */
export class FractionalOuModel extends StochasticModel {
  /**
   * Shared parameter parsing for the fOU family.
   *
   * @param {Object=} opts Model options.
   * @return {{nSteps: number, T: number, dt: number, theta: number, mu: number, sigma: number, H: number, x0: number}}
   *   Normalized parameter bundle.
   */
  static parseOpts(opts = {}) {
    const nSteps = opts.nSteps || 252;
    const T = opts.T !== undefined ? opts.T : 1.0;
    const dt = T / nSteps;
    const theta = opts.theta !== undefined ? opts.theta : 1.0;
    const mu = opts.mu !== undefined ? opts.mu : 0.0;
    const sigma = opts.sigma !== undefined ? opts.sigma : 1.0;
    const H = opts.h !== undefined ? opts.h : 0.5;
    const x0 = opts.x0 !== undefined ? opts.x0 : 0.0;
    return {nSteps, T, dt, theta, mu, sigma, H, x0};
  }

  /**
   * Shared time-grid construction for the fOU family.
   *
   * @param {number} nSteps Number of discrete steps.
   * @param {number} dt Time step size.
   * @return {Array<number>} Array of length `nSteps + 1` of cumulative times.
   */
  static buildTimes(nSteps, dt) {
    const times = new Array(nSteps + 1);
    times[0] = 0;
    for (let t = 1; t <= nSteps; t++) times[t] = t * dt;
    return times;
  }

  /**
   * Special-case fast path: exact Vasicek recursion when `H = 0.5`.
   *
   * @param {Object} opts Model options.
   * @return {{path: Float64Array, times: Array<number>}} Generated path
   *   and matching time grid.
   */
  vasicekPath(opts) {
    const {nSteps, dt, theta, mu, sigma, x0} =
      FractionalOuModel.parseOpts(opts);
    const times = FractionalOuModel.buildTimes(nSteps, dt);
    const path = new Float64Array(nSteps + 1);
    path[0] = x0;
    const decay = Math.exp(-theta * dt);
    const normConst = sigma * Math.sqrt((1 - decay * decay) / (2 * theta));
    for (let t = 1; t <= nSteps; t++) {
      path[t] = mu + (path[t - 1] - mu) * decay + normConst * nextGaussian();
    }
    return {path, times};
  }
}

/**
 * Euler-Maruyama discretization of the fOU model.
 *
 * Cheap O(n) integration; first-order accurate.
 */
export class EulerMaruyamaFractionalOuModel extends FractionalOuModel {
  simulate(opts = {}) {
    const {nSteps, dt, theta, mu, sigma, H, x0} =
      FractionalOuModel.parseOpts(opts);
    if (H === 0.5) {
      const {path, times} = this.vasicekPath(opts);
      return {paths: [path], times, brownians: []};
    }
    const times = FractionalOuModel.buildTimes(nSteps, dt);
    const path = new Float64Array(nSteps + 1);
    path[0] = x0;
    const fGn = generateFractionalNoise(nSteps, H);
    const sqrtDt = Math.sqrt(dt);
    for (let t = 1; t <= nSteps; t++) {
      const drift = theta * (mu - path[t - 1]) * dt;
      const diffusion = sigma * fGn[t - 1] * sqrtDt;
      path[t] = path[t - 1] + drift + diffusion;
    }
    return {paths: [path], times, brownians: []};
  }
}

/**
 * Exact Riemann-Liouville discretization of the fOU model.
 *
 * O(n^2) per path; higher-order accurate.
 */
export class ExactFractionalOuModel extends FractionalOuModel {
  simulate(opts = {}) {
    const {nSteps, dt, theta, mu, sigma, H, x0} =
      FractionalOuModel.parseOpts(opts);
    if (H === 0.5) {
      const {path, times} = this.vasicekPath(opts);
      return {paths: [path], times, brownians: []};
    }
    const times = FractionalOuModel.buildTimes(nSteps, dt);
    const path = new Float64Array(nSteps + 1);
    path[0] = x0;
    const kernel = new RiemannLiouvilleKernel(H).precompute(nSteps, dt);
    const fGn = generateFractionalNoise(nSteps, H);
    for (let t = 1; t <= nSteps; t++) {
      const drift = theta * (mu - path[t - 1]) * dt;
      let fracInt = 0;
      for (let j = 0; j < t; j++) {
        fracInt += kernel[t - 1 - j] * fGn[j];
      }
      fracInt *= Math.sqrt(dt);
      path[t] = path[t - 1] + drift + sigma * fracInt;
    }
    return {paths: [path], times, brownians: []};
  }
}

/**
 * Abstract base class for the Multifractional Process with Random
 * Exponent.
 *
 *     X_t = B_{H(t)}(t)
 *
 * where `H(t)` itself is a stochastic Ornstein-Uhlenbeck process
 * bounded between `hMin` and `hMax`. Two concrete subclasses pick the
 * discretization scheme:
 * - {@link LocalHolderMultifractionalPreModel} — default, cheap
 * - {@link ExactMultifractionalPreModel} — time-varying kernel
 *
 * @abstract
 */
export class MultifractionalPreModel extends StochasticModel {
  /**
   * Shared `H(t)` path generation under an OU bridge.
   *
   * @param {Object} opts Model options.
   * @return {Array<number>} Generated `H(t)` path of length `nSteps + 1`.
   */
  static generateHPath(opts) {
    const nSteps = opts.nSteps || 252;
    const T = opts.T !== undefined ? opts.T : 1.0;
    const dt = T / nSteps;
    const hMin = opts.hMin !== undefined ? opts.hMin : 0.05;
    const hMax = opts.hMax !== undefined ? opts.hMax : 0.95;
    const h0 = opts.h0 !== undefined ? opts.h0 : 0.1;
    const hProcess = opts.hProcess || {};
    const hTheta = hProcess.theta !== undefined ? hProcess.theta : 1.0;
    const hMu = hProcess.mu !== undefined ? hProcess.mu : 0.2;
    const hSigma = hProcess.sigma !== undefined ? hProcess.sigma : 0.1;
    const hPath = new Float64Array(nSteps + 1);
    hPath[0] = h0;
    const decay = Math.exp(-hTheta * dt);
    const hNoiseScale = hSigma * Math.sqrt((1 - decay * decay) / (2 * hTheta));
    for (let t = 1; t <= nSteps; t++) {
      const noise = nextGaussian();
      hPath[t] = hMu + (hPath[t - 1] - hMu) * decay + hNoiseScale * noise;
      hPath[t] = Math.max(hMin, Math.min(hMax, hPath[t]));
    }
    return {hPath, nSteps, dt};
  }
}

/**
 * Local-Holder approximation of the mPRE model.
 *
 * Cheap O(n) integration via cumulative `sqrt(dt^{2 * H_avg})` scaling.
 */
export class LocalHolderMultifractionalPreModel extends MultifractionalPreModel {
  simulate(opts = {}) {
    const {hPath, nSteps, dt} = MultifractionalPreModel.generateHPath(opts);
    const timeGrid = new Array(nSteps + 1);
    timeGrid[0] = 0;
    for (let t = 1; t <= nSteps; t++) timeGrid[t] = t * dt;
    const x0 = opts.x0 !== undefined ? opts.x0 : 0.0;
    const path = new Float64Array(nSteps + 1);
    path[0] = x0;
    for (let t = 1; t <= nSteps; t++) {
      const avgH = (hPath[t] + hPath[t - 1]) / 2;
      const variance = Math.pow(dt, 2 * avgH);
      path[t] = path[t - 1] + Math.sqrt(variance) * nextGaussian();
    }
    return {paths: [path], times: timeGrid, brownians: []};
  }
}

void LocalHolderMultifractionalPreModel;

/**
 * Exact time-varying-kernel discretization of the mPRE model.
 *
 * O(n^2) per path; uses a time-varying Riemann-Liouville kernel.
 */
export class ExactMultifractionalPreModel extends MultifractionalPreModel {
  simulate(opts = {}) {
    const {hPath, nSteps, dt} = MultifractionalPreModel.generateHPath(opts);
    const timeGrid = new Array(nSteps + 1);
    timeGrid[0] = 0;
    for (let t = 1; t <= nSteps; t++) timeGrid[t] = t * dt;
    const path = new Float64Array(nSteps + 1);
    path[0] = 0;
    const dW = new Float64Array(nSteps);
    for (let i = 0; i < nSteps; i++) dW[i] = nextGaussian();
    for (let t = 1; t <= nSteps; t++) {
      let increment = 0;
      for (let j = 0; j < t; j++) {
        const avgH = (hPath[t] + hPath[j]) / 2;
        const u = (t - j) * dt;
        const k = Math.sqrt(2 * avgH) * Math.pow(u, avgH - 0.5);
        increment += k * dW[j];
      }
      increment *= Math.sqrt(dt);
      path[t] = path[t - 1] + increment;
    }
    return {paths: [path], times: timeGrid, brownians: []};
  }
}
