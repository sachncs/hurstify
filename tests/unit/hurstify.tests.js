/**
 * Hurstify Core Tests
 * Google JS Style Guide compliant.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';

import {Hurstify} from '../../lib/hurstify.js';
import {generateFractionalBrownianMotion} from '../../lib/stochastic-generators.js';
import {
  getAsymptoticVariance,
  getConfidenceInterval,
  runKalmanFilter,
  ksCriticalValue,
  ksPvalue,
  KsSignificanceTest,
  CusumBreakTest,
  detectCusumBreakpoints,
  ConstancyTest,
  BootstrapConfidenceInterval,
} from '../../lib/inference.js';

import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';
import {
  computeKsDistance,
  shuffleArray,
  getRandomSample,
  permuteBlocks,
} from '../../lib/stats.js';

describe('Hurstify', function () {
  this.timeout(10000);

  it('should estimate H close to true value for synthetic fBM', function () {
    setRandomSeed(42);
    const H0 = 0.1;
    const fbm = generateFractionalBrownianMotion(2048, H0);
    const estimator = new Hurstify({scaleA1: 1, scaleA2: 50, sampleSize: 500});
    const window = fbm.slice(0, 512);
    const estimate = estimator.estimate(window);

    expect(estimate).to.be.within(0, 1);
    expect(Math.abs(estimate - H0)).to.be.below(0.3);
    resetRandomSeed();
  });

  it('should support multiple optimizer types', function () {
    setRandomSeed(123);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const window = fbm.slice(0, 256);

    const optimizers = ['brent', 'nelder-mead', 'annealing', 'ags'];
    for (const type of optimizers) {
      const estimator = new Hurstify({
        scaleA1: 1,
        scaleA2: 50,
        optimizerType: type,
      });
      const estimate = estimator.estimate(window);
      expect(estimate).to.be.within(
        0,
        1,
        `Optimizer ${type} produced invalid H=${estimate}`,
      );
    }
    resetRandomSeed();
  });

  it('should compute rolling estimates', function () {
    setRandomSeed(1);
    const fbm = generateFractionalBrownianMotion(2048, 0.1);
    const estimator = new Hurstify({
      scaleA1: 1,
      scaleA2: 50,
      sampleSize: 200,
      iterations: 4,
    });
    const results = estimator.rolling(fbm, 256, 100);

    expect(results.length).to.be.above(0);
    for (const r of results) {
      expect(r).to.have.property('t');
      expect(r).to.have.property('H');
      expect(r.H).to.satisfy((h) => h === null || (h > 0 && h < 1));
    }
    resetRandomSeed();
  });

  it('should support multi-scale strategy', function () {
    setRandomSeed(2);
    const fbm = generateFractionalBrownianMotion(2048, 0.15);
    const estimator = new Hurstify({
      scales: [1, 2, 5, 10],
      weights: [1.0, 0.8, 0.5, 0.3],
      sampleSize: 200,
    });
    const estimate = estimator.estimateSingle(fbm.slice(0, 512));

    expect(estimate).to.be.within(0, 1);
    resetRandomSeed();
  });

  it('should use variance reduction', function () {
    setRandomSeed(3);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({iterations: 8});

    const single = estimator.estimateSingle(fbm.slice(0, 256));
    const averaged = estimator.estimate(fbm.slice(0, 256));

    expect(single).to.be.a('number');
    expect(averaged).to.be.a('number');
    resetRandomSeed();
  });

  it('should respect configurable hMin and hMax bounds', function () {
    setRandomSeed(4);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({
      hMin: 0.05,
      hMax: 0.5,
      sampleSize: 200,
      iterations: 4,
    });
    const estimate = estimator.estimate(fbm.slice(0, 256));

    expect(estimate).to.be.within(0.05, 0.5);
    resetRandomSeed();
  });

  it('should support block random permutation', function () {
    setRandomSeed(5);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({
      blockSize: 16,
      sampleSize: 200,
      iterations: 4,
    });
    const estimate = estimator.estimate(fbm.slice(0, 256));

    expect(estimate).to.be.within(0, 1);
    resetRandomSeed();
  });

  it('should handle empty or short windows gracefully', function () {
    const estimator = new Hurstify();
    expect(() => estimator.estimateSingle([])).to.throw(
      'window must be a non-empty array',
    );
    expect(() => estimator.estimate([])).to.throw();
    expect(estimator.rolling([1, 2], 10)).to.deep.equal([]);
  });

  it('should reject invalid step in rolling', function () {
    const estimator = new Hurstify();
    expect(() => estimator.rolling([1, 2, 3], 1, 0)).to.throw(
      'step must be > 0',
    );
  });

  it('should return diagnostics from estimateSingleWithDiagnostics', function () {
    setRandomSeed(6);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({scaleA1: 1, scaleA2: 50, sampleSize: 200});
    const result = estimator.estimateSingleWithDiagnostics(fbm.slice(0, 256));

    expect(result).to.have.property('H');
    expect(result).to.have.property('minimizedD');
    expect(result.H).to.be.a('number');
    expect(result.minimizedD).to.be.a('number');
    expect(result.H).to.be.within(0, 1);
    expect(result.minimizedD).to.be.within(0, 1);
    resetRandomSeed();
  });

  it('should produce no trailing zeros in getIncrementsMulti', function () {
    const series = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const incMap = Hurstify.getIncrementsMulti(series, [1, 3]);
    const inc1 = incMap.get(1);
    const inc3 = incMap.get(3);

    expect(inc1).to.have.lengthOf(9);
    expect(inc3).to.have.lengthOf(7);
    expect(inc1[8]).to.not.equal(0);
    expect(inc3[6]).to.not.equal(0);
    expect(inc1[8]).to.equal(series[9] - series[8]);
    expect(inc3[6]).to.equal(series[9] - series[6]);
  });

  it('should run rollingMultiScale', function () {
    setRandomSeed(7);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({sampleSize: 200, iterations: 4});
    const scales = [1, 5, 10];
    const weights = [1, 0.8, 0.5];
    const results = estimator.rollingMultiScale(fbm, 256, scales, weights, 100);

    expect(results.length).to.be.above(0);
    for (const r of results) {
      expect(r).to.have.property('t');
      expect(r).to.have.property('H');
      expect(r).to.have.property('profile');
      expect(r.profile).to.be.an('array');
    }
    resetRandomSeed();
  });

  it('should return empty for short series in rollingMultiScale', function () {
    const estimator = new Hurstify();
    expect(estimator.rollingMultiScale([1, 2], 10, [1, 2])).to.deep.equal([]);
  });

  it('should reject invalid step in rollingMultiScale', function () {
    const estimator = new Hurstify();
    expect(() =>
      estimator.rollingMultiScale([1, 2, 3], 1, [1], null, 0),
    ).to.throw('step must be > 0');
  });

  it('should estimate batch', function () {
    setRandomSeed(8);
    const fbm = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({sampleSize: 200, iterations: 4});
    const windows = [
      fbm.slice(0, 256),
      fbm.slice(100, 356),
      fbm.slice(200, 456),
    ];
    const results = estimator.estimateBatch(windows);

    expect(results).to.have.lengthOf(3);
    for (const r of results) {
      expect(r).to.have.property('H');
      expect(r).to.have.property('error');
    }
    resetRandomSeed();
  });

  it('should handle invalid windows in batch', function () {
    const estimator = new Hurstify();
    const results = estimator.estimateBatch([[1, 2], []]);
    expect(results).to.have.lengthOf(2);
    expect(results[0].error).to.not.equal(null);
    expect(results[1].error).to.not.equal(null);
  });

  it('rollingMultiScale must not mutate estimator.scales or estimator.weights', function () {
    setRandomSeed(7);
    const path = generateFractionalBrownianMotion(1024, 0.1);
    const estimator = new Hurstify({
      sampleSize: 200,
      iterations: 4,
    });
    const beforeScales = estimator.scales;
    const beforeWeights = estimator.weights;
    estimator.rollingMultiScale(path, 256, [1, 5, 10], [1, 0.8, 0.5], 100);
    expect(estimator.scales).to.equal(beforeScales);
    expect(estimator.weights).to.equal(beforeWeights);
    resetRandomSeed();
  });

  it('should reject invalid configuration in constructor', function () {
    expect(() => new Hurstify({hMin: 0.5, hMax: 0.2})).to.throw(/hMin/);
    expect(() => new Hurstify({iterations: 0})).to.throw(/iterations/);
    expect(() => new Hurstify({sampleSize: 0})).to.throw(/sampleSize/);
    expect(() => new Hurstify({scales: [1, 2], weights: [1]})).to.throw(
      /weights/,
    );
  });
});

describe('Inference', function () {
  it('should compute asymptotic variance with corrected formula', function () {
    const varH = getAsymptoticVariance(1, 50, 500, 500);
    expect(varH).to.be.above(0);
    expect(varH).to.be.below(1);
  });

  it('should compute confidence interval', function () {
    const ci = getConfidenceInterval(0.1, 1, 50, 500, 500, 0.05);
    expect(ci.lower).to.be.below(0.1);
    expect(ci.upper).to.be.above(0.1);
  });

  it('should apply Kalman filter', function () {
    const hHistory = Array.from(
      {length: 100},
      () => 0.1 + Math.random() * 0.02,
    );
    const result = runKalmanFilter(hHistory, {q: 0.01, r: 0.1});
    expect(result.filtered).to.have.lengthOf(hHistory.length);
    expect(result.predictions).to.have.lengthOf(hHistory.length);
  });

  it('should compute KS critical value', function () {
    const cv = ksCriticalValue(500, 500, 0.05);
    expect(cv).to.be.above(0);
    expect(cv).to.be.below(1);
    expect(() => ksCriticalValue(0, 500, 0.05)).to.throw(
      'Sample sizes must be positive',
    );
  });

  it('should compute KS p-value', function () {
    const p = ksPvalue(0.1, 500, 500);
    expect(p).to.be.within(0, 1);
    expect(ksPvalue(0, 500, 500)).to.equal(1);
  });

  it('should run significance test', function () {
    const result = new KsSignificanceTest().run(
      {D: 0.05, n: 500, m: 500},
      {alpha: 0.05},
    );
    expect(result).to.have.property('significant');
    expect(result).to.have.property('pValue');
    expect(result).to.have.property('statistic');
    expect(result).to.have.property('criticalValue');
  });

  it('should run CUSUM test', function () {
    const hHistory = Array.from(
      {length: 50},
      (_, i) => 0.1 + (i > 25 ? 0.05 : 0),
    );
    const result = new CusumBreakTest().run(hHistory, {
      targetH: 0.1,
      threshold: 3.0,
    });
    expect(result).to.have.property('breakDetected');
    expect(result).to.have.property('maxCusum');
    expect(result).to.have.property('breakIndex');
  });

  it('should detect breakpoints', function () {
    const hHistory = Array.from(
      {length: 100},
      (_, i) => 0.1 + (i > 50 ? 0.05 : 0),
    );
    const breakpoints = detectCusumBreakpoints(hHistory, 20, 3.0);
    expect(breakpoints).to.be.an('array');
    if (breakpoints.length > 0) {
      expect(breakpoints[0]).to.have.property('index');
      expect(breakpoints[0]).to.have.property('H_before');
      expect(breakpoints[0]).to.have.property('H_after');
    }
  });

  it('should run constancy test', function () {
    const obs = Array.from({length: 50}, () => 0.1 + Math.random() * 0.01);
    const result = new ConstancyTest().run(obs, {q: 0.01, r: 0.1});
    expect(result).to.have.property('lrStat');
    expect(result).to.have.property('pValue');
    expect(result).to.have.property('constant');
  });

  it('should run bootstrap CI', function () {
    const estimator = new Hurstify({sampleSize: 200, iterations: 2});
    const window = generateFractionalBrownianMotion(512, 0.1).slice(0, 128);
    const result = new BootstrapConfidenceInterval().run(
      {window},
      {
        estimator: (w) => estimator.estimateSingle(w),
        nBoot: 100,
        alpha: 0.05,
      },
    );
    expect(result).to.have.property('lower');
    expect(result).to.have.property('upper');
    expect(result).to.have.property('pointEstimate');
    expect(result.lower).to.be.a('number');
    expect(result.upper).to.be.a('number');
  });
});

describe('KS Objective', function () {
  it('should return non-negative distance for random samples', function () {
    const s1 = new Array(100).fill(0).map(() => Math.random());
    const s2 = new Array(100).fill(0).map(() => Math.random());
    s1.sort((a, b) => a - b);
    s2.sort((a, b) => a - b);
    const dist = computeKsDistance(s1, s2, true);
    expect(dist).to.be.within(0, 1);
  });

  it('should return 0 for identical samples', function () {
    const s1 = [1, 2, 3, 4, 5];
    const s2 = [1, 2, 3, 4, 5];
    expect(computeKsDistance(s1, s2, false)).to.equal(0);
  });

  it('should return 1 for disjoint samples', function () {
    const s1 = [1, 2, 3];
    const s2 = [10, 11, 12];
    expect(computeKsDistance(s1, s2, false)).to.equal(1);
  });

  it('should throw for non-array inputs', function () {
    expect(() => computeKsDistance(null, [1, 2])).to.throw(
      'sample1 must be an array',
    );
    expect(() => computeKsDistance([1, 2], null)).to.throw(
      'sample2 must be an array',
    );
  });

  it('should throw for empty arrays', function () {
    expect(() => computeKsDistance([], [1, 2])).to.throw(
      'computeKsDistance requires non-empty arrays',
    );
  });

  it('should throw for non-finite values', function () {
    expect(() => computeKsDistance([1, NaN], [1, 2])).to.throw(
      'computeKsDistance requires finite values',
    );
  });
});

describe('Shuffle and Random Sample', function () {
  it('should shuffle arrays preserving elements', function () {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).to.have.lengthOf(arr.length);
    expect(shuffled.sort((a, b) => a - b)).to.deep.equal(arr);
  });

  it('should sample without replacement', function () {
    const arr = Array.from({length: 100}, (_, i) => i);
    const sample = getRandomSample(arr, 10);
    expect(sample).to.have.lengthOf(10);
    const unique = new Set(sample);
    expect(unique.size).to.equal(10);
  });

  it('should return full array when n >= length', function () {
    const arr = [1, 2, 3];
    expect(getRandomSample(arr, 5)).to.have.lengthOf(3);
  });

  it('should return empty array when n <= 0', function () {
    expect(getRandomSample([1, 2, 3], 0)).to.deep.equal([]);
  });
});

describe('Block Permutation', function () {
  it('should permute blocks preserving elements', function () {
    const data = Array.from({length: 20}, (_, i) => i);
    const perm = permuteBlocks(data, 5);
    expect(perm).to.have.lengthOf(data.length);
    expect(perm.sort((a, b) => a - b)).to.deep.equal(data);
  });

  it('should support random phase offset', function () {
    const data = Array.from({length: 21}, (_, i) => i);
    const perm = permuteBlocks(data, 5, true);
    expect(perm).to.have.lengthOf(data.length);
  });

  it('should throw for invalid blockSize', function () {
    expect(() => permuteBlocks([1, 2], 0)).to.throw(
      'blockSize must be positive',
    );
    expect(() => permuteBlocks([1, 2], 5)).to.throw(
      'blockSize must be positive and not exceed data length',
    );
  });

  it('should throw for non-array input', function () {
    expect(() => permuteBlocks(null, 2)).to.throw('data must be an array');
  });
});

describe('fBM generation', function () {
  it('should generate valid fBM paths', function () {
    const fbm = generateFractionalBrownianMotion(512, 0.1);
    expect(fbm).to.have.lengthOf(512);
    expect(fbm.every((v) => Number.isFinite(v))).to.equal(true);
  });

  it('should throw for invalid H', function () {
    expect(() => generateFractionalBrownianMotion(100, 0)).to.throw(
      'H must satisfy 0 < H < 1',
    );
    expect(() => generateFractionalBrownianMotion(100, 1)).to.throw(
      'H must satisfy 0 < H < 1',
    );
  });

  it('should return empty array for n <= 0', function () {
    expect(generateFractionalBrownianMotion(0, 0.5)).to.have.lengthOf(0);
  });
});
