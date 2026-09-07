/**
 * PRNG tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {setRandomSeed, resetRandomSeed, nextRandom} from '../../lib/prng.js';

describe('PRNG', function () {
  it('produces deterministic output with seed', function () {
    setRandomSeed(42);
    const a = [nextRandom(), nextRandom(), nextRandom()];
    setRandomSeed(42);
    const b = [nextRandom(), nextRandom(), nextRandom()];
    expect(a).to.deep.equal(b);
  });

  it('produces different streams with different seeds', function () {
    setRandomSeed(1);
    const a = nextRandom();
    setRandomSeed(2);
    const b = nextRandom();
    expect(a).to.not.equal(b);
  });

  it('falls back to Math.random when seed is null', function () {
    setRandomSeed(null);
    const a = nextRandom();
    expect(a).to.be.within(0, 1);
  });

  it('resetRandomSeed reverts to Math.random', function () {
    setRandomSeed(42);
    resetRandomSeed();
    const a = nextRandom();
    expect(a).to.be.within(0, 1);
  });

  it('handles seed of 0', function () {
    setRandomSeed(0);
    const a = nextRandom();
    expect(a).to.be.within(0, 1);
  });

  it('produces uniform-ish distribution', function () {
    setRandomSeed(123);
    const n = 1000;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += nextRandom();
    }
    const mean = sum / n;
    expect(mean).to.be.closeTo(0.5, 0.05);
    resetRandomSeed();
  });
});
