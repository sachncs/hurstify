/**
 * Kernel strategy unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  RiemannLiouvilleKernel,
  TimeVaryingKernel,
} from '../../lib/strategies/kernel.js';

describe('RiemannLiouvilleKernel', function () {
  it('throws on out-of-range H', function () {
    expect(() => new RiemannLiouvilleKernel(0)).to.throw();
    expect(() => new RiemannLiouvilleKernel(1)).to.throw();
    expect(() => new RiemannLiouvilleKernel(-0.1)).to.throw();
  });

  it('evaluates positive for any t > 0', function () {
    const k = new RiemannLiouvilleKernel(0.3);
    expect(k.evaluate(0.5)).to.be.above(0);
    expect(k.evaluate(1.0)).to.be.above(0);
  });

  it('precomputes correct-length cache', function () {
    const k = new RiemannLiouvilleKernel(0.4);
    const cache = k.precompute(50, 0.01);
    expect(cache).to.have.lengthOf(50);
    expect(cache.every((v) => v > 0)).to.equal(true);
  });
});

describe('TimeVaryingKernel', function () {
  it('throws on empty hPath', function () {
    expect(() => new TimeVaryingKernel([])).to.throw();
  });

  it('evaluates based on local H at t', function () {
    const k = new TimeVaryingKernel([0.1, 0.1, 0.1, 0.1], 1);
    const v = k.evaluate(2);
    expect(v).to.be.above(0);
  });

  it('collapses to RiemannLiouville for constant H', function () {
    const constPath = [0.3, 0.3, 0.3, 0.3];
    const dt = 0.5;
    const k = new TimeVaryingKernel(constPath, dt);
    const rl = new RiemannLiouvilleKernel(0.3);
    for (const t of [0.5, 1.0, 1.5]) {
      expect(k.evaluate(t)).to.be.closeTo(rl.evaluate(t), 1e-9);
    }
  });
});
