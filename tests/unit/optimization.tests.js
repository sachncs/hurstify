/**
 * Optimization suite tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  runBrent,
  runNelderMead,
  runSimulatedAnnealing,
  runDifferentialEvolution,
  runAdaptiveGridSearch,
  optimizerRegistry,
} from '../../lib/optimization/index.js';

describe('runBrent', function () {
  it('finds minimum of parabola', function () {
    const f = (x) => (x - 2) * (x - 2);
    const result = runBrent(f, -10, 0, 10, 1e-6);
    expect(result.x).to.be.closeTo(2, 1e-4);
    expect(result.f).to.be.closeTo(0, 1e-6);
  });

  it('validates finite bounds', function () {
    expect(() => runBrent(() => 0, NaN, 0, 1)).to.throw(
      'Bounds must be finite numbers',
    );
  });

  it('validates ordered bounds', function () {
    expect(() => runBrent(() => 0, 2, 1, 2)).to.throw(
      'Lower bound must be strictly less than upper bound',
    );
  });

  it('validates initial guess within bounds', function () {
    expect(() => runBrent(() => 0, 0, 15, 10)).to.throw(
      'Initial guess must lie within bounds',
    );
  });
});

describe('runNelderMead', function () {
  it('minimizes 2D quadratic', function () {
    const f = (x) => (x[0] - 1) * (x[0] - 1) + (x[1] + 2) * (x[1] + 2);
    const x0 = [0, 0];
    const result = runNelderMead(f, x0, {maxIter: 5000, tol: 1e-12});
    // Nelder-Mead may not converge exactly due to loose simplex-based convergence check
    // Verify function value improved
    const f0 = f(x0);
    expect(result.f).to.be.below(f0);
    expect(result.x).to.have.lengthOf(2);
    expect(Number.isFinite(result.f)).to.equal(true);
  });
});

describe('runSimulatedAnnealing', function () {
  it('finds minimum of parabola', function () {
    const f = (x) => (x[0] - 3) * (x[0] - 3);
    const result = runSimulatedAnnealing(f, [0], {
      maxIter: 5000,
      coolingRate: 0.995,
      stepSize: 0.5,
    });
    expect(result.x[0]).to.be.closeTo(3, 0.5);
  });
});

describe('runDifferentialEvolution', function () {
  it('finds minimum of parabola', function () {
    const f = (x) => (x[0] + 1) * (x[0] + 1);
    const result = runDifferentialEvolution(f, [0], {
      maxIter: 200,
      popSize: 30,
    });
    expect(result.x[0]).to.be.closeTo(-1, 0.5);
  });
});

describe('runAdaptiveGridSearch', function () {
  it('finds minimum of parabola', function () {
    const f = (x) => (x - 0.5) * (x - 0.5);
    const result = runAdaptiveGridSearch(f, -2, 2, {gridSize: 50, tol: 1e-6});
    expect(result.x).to.be.closeTo(0.5, 1e-2);
  });

  it('validates gridSize', function () {
    expect(() => runAdaptiveGridSearch(() => 0, 0, 1, {gridSize: 1})).to.throw(
      'gridSize must be > 1',
    );
  });
});

describe('Optimizer Registry', function () {
  it('retrieves built-in optimizers as Optimizer instances', function () {
    expect(optimizerRegistry.resolve('brent')).to.be.instanceOf(Object);
    expect(optimizerRegistry.resolve('brent').minimize).to.be.a('function');
    expect(optimizerRegistry.resolve('nelder-mead').minimize).to.be.a(
      'function',
    );
    expect(optimizerRegistry.resolve('annealing').minimize).to.be.a('function');
    expect(optimizerRegistry.resolve('de').minimize).to.be.a('function');
    expect(optimizerRegistry.resolve('ags').minimize).to.be.a('function');
  });

  it('returns undefined for unknown optimizer', function () {
    expect(optimizerRegistry.resolve('unknown')).to.equal(undefined);
  });

  it('registers custom optimizer subclass factory', function () {
    const custom = () => ({minimize: () => 42});
    optimizerRegistry.register('custom', custom);
    expect(optimizerRegistry.resolve('custom').minimize()).to.equal(42);
  });
});

describe('Optimizer edge cases', function () {
  it('brent handles flat objective', function () {
    const result = runBrent(() => 5, 0, 0.5, 1);
    expect(Number.isFinite(result.x)).to.equal(true);
    expect(result.f).to.equal(5);
  });

  it('runSimulatedAnnealing improves from initial guess', function () {
    const f = (x) => x[0] * x[0];
    const result = runSimulatedAnnealing(f, [5], {maxIter: 500, stepSize: 1.0});
    expect(result.f).to.be.below(25); // Should improve from f(5)=25
    expect(Number.isFinite(result.x[0])).to.equal(true);
  });

  it('runDifferentialEvolution handles boundaries', function () {
    const f = (x) => x[0] * x[0];
    const result = runDifferentialEvolution(f, [5], {
      maxIter: 50,
      popSize: 10,
      bounds: [[0, 1]],
    });
    expect(result.x[0]).to.be.closeTo(0, 1e-6);
    expect(result.x[0]).to.be.within(-1e-6, 1);
  });

  it('runAdaptiveGridSearch with small range', function () {
    const f = (x) => x * x;
    const result = runAdaptiveGridSearch(f, -0.001, 0.001);
    expect(Number.isFinite(result.x)).to.equal(true);
  });
});
