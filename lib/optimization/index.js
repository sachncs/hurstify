/**
 * @fileoverview Re-exports for the optimization layer.
 *
 * Provides a single import surface for every optimizer shipped with the
 * library. Consumers either instantiate a concrete `Optimizer` subclass
 * directly, or look up a built-in by short key through
 * {@link optimizerRegistry}.
 */

export {Optimizer} from './optimizer.js';
export {runBrent} from './brent.js';
export {runNelderMead} from './nelderMead.js';
export {runSimulatedAnnealing} from './simulatedAnnealing.js';
export {runDifferentialEvolution} from './differentialEvolution.js';
export {runAdaptiveGridSearch} from './adaptiveGridSearch.js';
export {BrentOptimizer} from './brent.js';
export {AdaptiveGridSearchOptimizer} from './adaptiveGridSearch.js';
export {NelderMeadOptimizer} from './nelderMead.js';
export {SimulatedAnnealingOptimizer} from './simulatedAnnealing.js';
export {DifferentialEvolutionOptimizer} from './differentialEvolution.js';
export {optimizerRegistry} from './registry.js';
