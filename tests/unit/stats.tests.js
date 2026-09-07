/**
 * Statistical utilities tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  computeKsDistance,
  computeKsDistanceRescaled,
  shuffleArray,
  getRandomSample,
  permuteBlocks,
} from '../../lib/stats.js';
import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';

describe('computeKsDistance', function () {
  it('computes zero distance for identical samples', function () {
    const s = [1, 2, 3, 4, 5];
    expect(computeKsDistance(s, s, false)).to.equal(0);
  });

  it('computes one distance for disjoint samples', function () {
    expect(computeKsDistance([1, 2, 3], [10, 11, 12], false)).to.equal(1);
  });

  it('handles ties correctly', function () {
    const s1 = [1, 2, 2, 3];
    const s2 = [2, 2, 4];
    const d = computeKsDistance(s1, s2, false);
    expect(d).to.be.within(0, 1);
  });

  it('validates input types', function () {
    expect(() => computeKsDistance(null, [1])).to.throw(
      'sample1 must be an array',
    );
    expect(() => computeKsDistance([1], null)).to.throw(
      'sample2 must be an array',
    );
  });

  it('validates non-empty arrays', function () {
    expect(() => computeKsDistance([], [1])).to.throw(
      'computeKsDistance requires non-empty arrays',
    );
    expect(() => computeKsDistance([1], [])).to.throw(
      'computeKsDistance requires non-empty arrays',
    );
  });

  it('validates finite values', function () {
    expect(() => computeKsDistance([1, Infinity], [1, 2])).to.throw(
      'computeKsDistance requires finite values',
    );
    expect(() => computeKsDistance([1, 2], [NaN, 2])).to.throw(
      'computeKsDistance requires finite values',
    );
  });

  it('works with Float64Array', function () {
    const a = new Float64Array([1, 2, 3]);
    const b = new Float64Array([2, 3, 4]);
    expect(computeKsDistance(a, b, false)).to.be.a('number');
  });

  it('is symmetric', function () {
    setRandomSeed(7);
    const s1 = new Array(50).fill(0).map(() => Math.random());
    const s2 = new Array(50).fill(0).map(() => Math.random());
    const d1 = computeKsDistance(s1, s2, false);
    const d2 = computeKsDistance(s2, s1, false);
    expect(d1).to.equal(d2);
    resetRandomSeed();
  });
});

describe('computeKsDistanceRescaled', function () {
  it('matches computeKsDistance for identity factors', function () {
    const a = new Float64Array([1, 2, 3, 4, 5]);
    const b = new Float64Array([2, 3, 4, 5, 6]);
    const d1 = computeKsDistance(a, b, false);
    const d2 = computeKsDistanceRescaled(a, b, 1, 1);
    expect(d2).to.equal(d1);
  });

  it('returns zero for identical rescaled samples', function () {
    const a = new Float64Array([1, 2, 3]);
    // a*2 = [2,4,6], b*1 = [2,4,6]
    const b = new Float64Array([2, 4, 6]);
    expect(computeKsDistanceRescaled(a, b, 2, 1)).to.equal(0);
  });

  it('validates non-empty arrays', function () {
    expect(() => computeKsDistanceRescaled([], [1], 1, 1)).to.throw(
      'computeKsDistanceRescaled requires non-empty arrays',
    );
    expect(() => computeKsDistanceRescaled([1], [], 1, 1)).to.throw(
      'computeKsDistanceRescaled requires non-empty arrays',
    );
  });

  it('works with regular arrays', function () {
    const a = [1, 2, 3];
    const b = [10, 11, 12];
    expect(computeKsDistanceRescaled(a, b, 1, 1)).to.equal(1);
  });
});

describe('shuffleArray', function () {
  it('preserves all elements', function () {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort((a, b) => a - b)).to.deep.equal(arr);
  });

  it('does not mutate original', function () {
    const arr = [1, 2, 3];
    shuffleArray(arr);
    expect(arr).to.deep.equal([1, 2, 3]);
  });

  it('handles empty array', function () {
    expect(shuffleArray([])).to.deep.equal([]);
  });
});

describe('getRandomSample', function () {
  it('samples without replacement', function () {
    setRandomSeed(8);
    const arr = Array.from({length: 100}, (_, i) => i);
    const sample = getRandomSample(arr, 20);
    expect(sample).to.have.lengthOf(20);
    expect(new Set(sample).size).to.equal(20);
    resetRandomSeed();
  });

  it('returns full array when n >= length', function () {
    const arr = [1, 2, 3];
    const sample = getRandomSample(arr, 5);
    expect(sample.sort((a, b) => a - b)).to.deep.equal(arr);
  });

  it('returns empty array for n <= 0', function () {
    expect(getRandomSample([1, 2, 3], 0)).to.deep.equal([]);
    expect(getRandomSample([1, 2, 3], -1)).to.deep.equal([]);
  });
});

describe('permuteBlocks', function () {
  it('preserves all elements', function () {
    setRandomSeed(9);
    const data = Array.from({length: 30}, (_, i) => i);
    const perm = permuteBlocks(data, 6);
    expect(perm.sort((a, b) => a - b)).to.deep.equal(data);
    resetRandomSeed();
  });

  it('supports random phase', function () {
    setRandomSeed(10);
    const data = Array.from({length: 25}, (_, i) => i);
    const perm = permuteBlocks(data, 5, true);
    expect(perm.sort((a, b) => a - b)).to.deep.equal(data);
    resetRandomSeed();
  });

  it('throws for invalid blockSize', function () {
    expect(() => permuteBlocks([1, 2], 0)).to.throw(
      'blockSize must be positive',
    );
    expect(() => permuteBlocks([1, 2], 3)).to.throw(
      'blockSize must be positive and not exceed data length',
    );
  });

  it('throws for non-array input', function () {
    expect(() => permuteBlocks(null, 2)).to.throw('data must be an array');
  });

  it('works with Float64Array', function () {
    setRandomSeed(11);
    const data = new Float64Array([1, 2, 3, 4, 5, 6]);
    const perm = permuteBlocks(data, 2);
    expect(perm.length).to.equal(6);
    resetRandomSeed();
  });
});
