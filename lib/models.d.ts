/**
 * Type declarations for the rough-volatility model and forecaster
 * strategy hierarchy.
 */
export {
  RoughBergomiModel,
  RoughFsvModel,
  FractionalOuModel,
  MultifractionalPreModel,
  StochasticModel,
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
  Forecaster,
} from './strategies.js';

export declare const modelRegistry: import('./strategies.js').Registry<
  import('./strategies.js').StochasticModel
>;
export declare const forecasterRegistry: import('./strategies.js').Registry<
  import('./strategies.js').Forecaster
>;

export declare function getModel(
  name: string,
): import('./strategies.js').StochasticModel | undefined;

export declare function registerModel(
  name: string,
  factory: () => import('./strategies.js').StochasticModel,
): void;

export declare function listModels(): string[];

export declare function getForecaster(
  name: string,
): import('./strategies.js').Forecaster | undefined;

export declare function registerForecaster(
  name: string,
  factory: () => import('./strategies.js').Forecaster,
): void;

export declare function listForecasters(): string[];
