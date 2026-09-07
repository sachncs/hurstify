/**
 * KsObjective strategy unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  PairwiseKsObjective,
  MultiScaleKsObjective,
  WeightedMultiScaleKsObjective,
  chooseKsObjective,
} from '../../lib/strategies/ks-objective.js';

describe('PairwiseKsObjective', function () {
  it('returns 0 for identical rescaled samples at correct H', function () {
    const samples = [
      new Float64Array([1, 2, 3, 4, 5]),
      new Float64Array([2, 4, 6, 8, 10]),
    ];
    const obj = new PairwiseKsObjective();
    // Scales 1, 2; H=1 makes factor=1 for scale 1 and factor=0.5 for scale 2
    // Actually a^{-H}: 1^{-1}=1, 2^{-1}=0.5 -> [1,2,3,4,5]*1 = [1,2,3,4,5],
    // [2,4,6,8,10]*0.5 = [1,2,3,4,5], so should be 0.
    const d = obj.evaluate(samples, [1, 2], 1);
    expect(d).to.be.closeTo(0, 1e-9);
  });

  it('is non-negative', function () {
    const obj = new PairwiseKsObjective();
    const samples = [
      new Float64Array([1, 4, 7, 10]),
      new Float64Array([2, 5, 8, 11]),
    ];
    const d = obj.evaluate(samples, [1, 2], 0.3);
    expect(d).to.be.at.least(0);
  });
});

describe('MultiScaleKsObjective', function () {
  it('averages pairwise KS distances', function () {
    const samples = [
      new Float64Array([1, 2, 3, 4, 5]),
      new Float64Array([1, 2, 3, 4, 5]),
      new Float64Array([1, 2, 3, 4, 5]),
    ];
    const obj = new MultiScaleKsObjective();
    const d = obj.evaluate(samples, [1, 2, 3], 0);
    expect(d).to.be.closeTo(0, 1e-9);
  });

  it('handles two scales as pairwise mean', function () {
    const samples = [new Float64Array([1, 2, 3]), new Float64Array([1, 2, 3])];
    const obj = new MultiScaleKsObjective();
    const d = obj.evaluate(samples, [1, 2], 0);
    expect(d).to.equal(0);
  });
});

describe('WeightedMultiScaleKsObjective', function () {
  it('rejects empty weights', function () {
    expect(() => new WeightedMultiScaleKsObjective([])).to.throw();
  });

  it('rejects non-positive weights', function () {
    expect(() => new WeightedMultiScaleKsObjective([1, 0, 1])).to.throw();
    expect(() => new WeightedMultiScaleKsObjective([1, -1, 1])).to.throw();
  });

  it('returns 0 for identical samples', function () {
    const samples = [
      new Float64Array([1, 2, 3]),
      new Float64Array([1, 2, 3]),
      new Float64Array([1, 2, 3]),
    ];
    const obj = new WeightedMultiScaleKsObjective([1, 1, 1]);
    expect(obj.evaluate(samples, [1, 2, 3], 0)).to.equal(0);
  });
});

describe('chooseKsObjective', function () {
  it('returns WeightedMultiScaleKsObjective for multi-scale + weights', function () {
    expect(chooseKsObjective([1, 2, 3], [1, 1, 1])).to.be.instanceOf(
      WeightedMultiScaleKsObjective,
    );
  });

  it('returns MultiScaleKsObjective for multi-scale without weights', function () {
    expect(chooseKsObjective([1, 2, 3])).to.be.instanceOf(
      MultiScaleKsObjective,
    );
  });

  it('returns PairwiseKsObjective for two scales', function () {
    expect(chooseKsObjective()).to.be.instanceOf(PairwiseKsObjective);
    expect(chooseKsObjective([1, 2])).to.be.instanceOf(PairwiseKsObjective);
  });
});
