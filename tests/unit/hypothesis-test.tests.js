/**
 * HypothesisTest strategy unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  KsSignificanceTest,
  ConstancyTest,
  CusumBreakTest,
  BootstrapConfidenceInterval,
} from '../../lib/strategies/hypothesis-test.js';
import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';

describe('KsSignificanceTest', function () {
  const test = new KsSignificanceTest();

  it('returns the expected shape', function () {
    const r = test.run({D: 0.05, n: 500, m: 500, alpha: 0.05});
    expect(r).to.have.all.keys(
      'significant',
      'pValue',
      'statistic',
      'criticalValue',
    );
  });

  it('throws on negative D', function () {
    expect(() => test.run({D: -1, n: 100, m: 100})).to.throw();
  });
});

describe('ConstancyTest', function () {
  const test = new ConstancyTest();

  it('returns the expected shape', function () {
    const r = test.run(
      Array.from({length: 30}, () => 0.1 + Math.random() * 0.01),
      {q: 0.01, r: 0.1},
    );
    expect(r).to.have.all.keys('lrStat', 'pValue', 'constant');
  });
});

describe('CusumBreakTest', function () {
  const test = new CusumBreakTest();

  it('flags a synthetic step change', function () {
    const series = Array.from(
      {length: 50},
      (_, i) => 0.1 + (i > 25 ? 0.05 : 0),
    );
    const r = test.run(series, {targetH: 0.1, threshold: 3.0});
    expect(r).to.have.all.keys('breakDetected', 'maxCusum', 'breakIndex');
  });

  it('returns safe defaults for flat series', function () {
    const r = test.run([0.1, 0.1, 0.1], {targetH: 0.1});
    expect(r.breakDetected).to.equal(false);
  });

  it('throws on empty input', function () {
    expect(() => test.run([])).to.throw();
  });
});

describe('BootstrapConfidenceInterval', function () {
  const test = new BootstrapConfidenceInterval();

  it('requires an estimator', function () {
    expect(() => test.run({window: [1, 2, 3]}, {})).to.throw();
  });

  it('returns sensible CI bounds', function () {
    setRandomSeed(42);
    const window = Array.from({length: 100}, () => 0.1 + Math.random() * 0.01);
    const r = test.run(
      {window},
      {estimator: (w) => w.reduce((a, b) => a + b, 0) / w.length, nBoot: 50},
    );
    expect(r).to.have.all.keys('lower', 'upper', 'pointEstimate');
    expect(r.lower).to.be.at.most(r.pointEstimate);
    expect(r.upper).to.be.at.least(r.pointEstimate);
    resetRandomSeed();
  });

  it('handles empty bootstrap (degenerate nBoot)', function () {
    setRandomSeed(1);
    const window = [1, 2, 3];
    const r = test.run({window}, {estimator: () => 0.5, nBoot: 0, alpha: 0.05});
    expect(r.lower).to.equal(0.5);
    expect(r.upper).to.equal(0.5);
    resetRandomSeed();
  });
});
