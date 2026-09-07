/**
 * @fileoverview Public export surface for the rough-volatility model
 * zoo and forecaster hierarchy.
 *
 * v2.0.0 is a hard break from v1.x: the legacy free functions
 * (`rBergomi`, `rFSV`, `fOU`, `exactOU`, `mPRE`, `mPREExact`,
 * `arfima`, `holtWintersForecast`, `createLSTM`, `createAttentionModel`)
 * have been removed. Consumers should use the polymorphic strategy
 * classes directly:
 *
 * - Stochastic processes: instantiate `RoughBergomiModel`,
 *   `RoughFsvModel`, `EulerMaruyamaFractionalOuModel`,
 *   `ExactFractionalOuModel`, `LocalHolderMultifractionalPreModel`,
 *   or `ExactMultifractionalPreModel` and call `simulate(opts)`.
 *   `FractionalOuModel` and `MultifractionalPreModel` are abstract
 *   bases — subclassing or the registry picks the concrete
 *   discretization.
 * - H forecasting: instantiate `ArfimaForecaster`,
 *   `HoltWintersForecaster`, `LstmForecaster`, or `AttentionForecaster`
 *   and call `predict(history)`.
 */

import {Registry} from '../strategies/registry.js';
import {
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  EulerMaruyamaFractionalOuModel,
  ExactFractionalOuModel,
  MultifractionalPreModel,
  LocalHolderMultifractionalPreModel,
  ExactMultifractionalPreModel,
} from '../strategies/model.js';
import {
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
} from '../strategies/forecaster.js';

export {
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  EulerMaruyamaFractionalOuModel,
  ExactFractionalOuModel,
  MultifractionalPreModel,
  LocalHolderMultifractionalPreModel,
  ExactMultifractionalPreModel,
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
};

/**
 * Strategy registry for stochastic models. The default `fOU` key
 * resolves to the Euler-Maruyama discretization; consumers who want
 * the exact Riemann-Liouville variant look up `fOU-exact`. Same
 * convention for `mPRE` / `mPRE-exact`.
 *
 * @type {Registry<StochasticModel>}
 */
export const modelRegistry = new Registry();
modelRegistry.register('rBergomi', () => new RoughBergomiModel());
modelRegistry.register('rFSV', () => new RoughFsvModel());
modelRegistry.register('fOU', () => new EulerMaruyamaFractionalOuModel());
modelRegistry.register('fOU-exact', () => new ExactFractionalOuModel());
modelRegistry.register('mPRE', () => new LocalHolderMultifractionalPreModel());
modelRegistry.register('mPRE-exact', () => new ExactMultifractionalPreModel());

/**
 * Strategy registry for forecasters.
 *
 * @type {Registry<Forecaster>}
 */
export const forecasterRegistry = new Registry();
forecasterRegistry.register('arfima', () => new ArfimaForecaster());
forecasterRegistry.register('holtWinters', () => new HoltWintersForecaster());
forecasterRegistry.register('lstm', () => new LstmForecaster());
forecasterRegistry.register('attention', () => new AttentionForecaster());

/**
 * Retrieves a registered model strategy by name.
 *
 * @param {string} name Model identifier.
 * @return {StochasticModel|undefined}
 *   The strategy instance, or `undefined` when the name is unknown.
 */
export function getModel(name) {
  return modelRegistry.resolve(name);
}

/**
 * Registers a new model strategy under the supplied name.
 *
 * @param {string} name Unique identifier.
 * @param {function(): StochasticModel} factory
 *   Factory returning a fresh instance.
 */
export function registerModel(name, factory) {
  modelRegistry.register(name, factory);
}

/**
 * Lists every registered model strategy identifier.
 *
 * @return {Array<string>} Snapshot of registered model keys.
 */
export function listModels() {
  return modelRegistry.list();
}

/**
 * Retrieves a registered forecaster by name.
 *
 * @param {string} name Forecaster identifier.
 * @return {Forecaster|undefined}
 *   The strategy instance.
 */
export function getForecaster(name) {
  return forecasterRegistry.resolve(name);
}

/**
 * Registers a new forecaster strategy under the supplied name.
 *
 * @param {string} name Unique identifier.
 * @param {function(): Forecaster} factory
 *   Factory returning a fresh instance.
 */
export function registerForecaster(name, factory) {
  forecasterRegistry.register(name, factory);
}

/**
 * Lists every registered forecaster identifier.
 *
 * @return {Array<string>} Snapshot of registered forecaster keys.
 */
export function listForecasters() {
  return forecasterRegistry.list();
}
