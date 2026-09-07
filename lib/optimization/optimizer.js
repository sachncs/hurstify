/**
 * @fileoverview Strategy base class for pluggable optimizers.
 *
 * Every algorithm in `optimization/` (Brent, Nelder-Mead, simulated
 * annealing, differential evolution, adaptive grid search) extends this
 * base class so the hurstify estimator can dispatch on the concrete
 * subtype through a single uniform method: `minimize(...)`.
 *
 * The estimator holds an `Optimizer` instance, not a string identifier;
 * the registry resolves string keys into instances for callers that
 * prefer that ergonomics.
 */

/**
 * Strategy base class. Subclasses implement `minimize` polymorphically.
 */
export class Optimizer {
  /**
   * Minimizes the given objective on the closed interval `[lower, upper]`
   * starting from `initial`. Subclasses implement the algorithm-specific
   * search.
   *
   * @param {function(number): number} _objective Scalar objective function.
   * @param {number} _lower Lower bound of the search interval.
   * @param {number} _upper Upper bound of the search interval.
   * @param {number} _initial Initial guess inside `[_lower, _upper]`.
   * @return {number} Argmin `h` inside `[_lower, _upper]`.
   */
  minimize(_objective, _lower, _upper, _initial) {
    throw new Error(
      `${this.constructor.name}.minimize() is not implemented; ` +
        `use a concrete Optimizer subclass.`,
    );
  }
}
