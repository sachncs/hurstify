/**
 * @fileoverview Optimizer registry mapping short string keys to
 * `Optimizer` strategy instances.
 *
 * The estimator holds an `Optimizer` instance (or a string key that is
 * resolved here into one). The registry is the single source of truth
 * for built-in and user-registered optimizers.
 */

import {BrentOptimizer} from './brent.js';
import {AdaptiveGridSearchOptimizer} from './adaptiveGridSearch.js';
import {NelderMeadOptimizer} from './nelderMead.js';
import {SimulatedAnnealingOptimizer} from './simulatedAnnealing.js';
import {DifferentialEvolutionOptimizer} from './differentialEvolution.js';
import {Registry} from '../strategies/registry.js';

/**
 * Global optimizer registry.
 *
 * @type {Registry<Optimizer>}
 */
export const optimizerRegistry = new Registry();

optimizerRegistry.register('brent', () => new BrentOptimizer());
optimizerRegistry.register('ags', () => new AdaptiveGridSearchOptimizer());
optimizerRegistry.register('nelder-mead', () => new NelderMeadOptimizer());
optimizerRegistry.register(
  'annealing',
  () => new SimulatedAnnealingOptimizer(),
);
optimizerRegistry.register('de', () => new DifferentialEvolutionOptimizer());
