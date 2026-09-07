/**
 * Sampler strategy unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  ReservoirSampler,
  BlockPermutationSampler,
  IdentitySampler,
  defaultSampler,
} from '../../lib/strategies/sampler.js';
import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';

describe('ReservoirSampler', function () {
  it('draws without replacement', function () {
    const sampler = new ReservoirSampler();
    const inc = Array.from({length: 100}, (_, i) => i);
    const sample = sampler.draw(inc, 10);
    expect(sample).to.have.lengthOf(10);
    expect(new Set(sample).size).to.equal(10);
  });

  it('clamps n to input length', function () {
    const sampler = new ReservoirSampler();
    const inc = [1, 2, 3];
    expect(sampler.draw(inc, 10)).to.have.lengthOf(3);
  });

  it('returns empty for n <= 0', function () {
    const sampler = new ReservoirSampler();
    expect(sampler.draw([1, 2, 3], 0)).to.deep.equal([]);
  });
});

describe('BlockPermutationSampler', function () {
  it('preserves all elements after permutation', function () {
    const sampler = new BlockPermutationSampler(5);
    const data = Array.from({length: 30}, (_, i) => i);
    const out = sampler.draw(data, 30);
    expect(out.slice().sort((a, b) => a - b)).to.deep.equal(data);
  });

  it('supports random phase offset', function () {
    const sampler = new BlockPermutationSampler(5, true);
    const data = Array.from({length: 21}, (_, i) => i);
    expect(sampler.draw(data, 21).length).to.equal(21);
  });

  it('throws on invalid blockSize', function () {
    expect(() => new BlockPermutationSampler(0)).to.throw();
  });

  it('is deterministic with seed', function () {
    setRandomSeed(7);
    const sampler = new BlockPermutationSampler(4);
    const data = Array.from({length: 40}, (_, i) => i);
    const a = sampler.draw(data, 40);
    setRandomSeed(7);
    const b = sampler.draw(data, 40);
    expect(a).to.deep.equal(b);
    resetRandomSeed();
  });
});

describe('IdentitySampler', function () {
  it('returns input unchanged', function () {
    const sampler = new IdentitySampler();
    expect(sampler.draw([1, 2, 3], 3)).to.deep.equal([1, 2, 3]);
  });
});

describe('defaultSampler', function () {
  it('returns BlockPermutationSampler when blockSize > 0', function () {
    expect(defaultSampler(16)).to.be.instanceOf(BlockPermutationSampler);
  });

  it('returns ReservoirSampler otherwise', function () {
    expect(defaultSampler(null)).to.be.instanceOf(ReservoirSampler);
    expect(defaultSampler(undefined)).to.be.instanceOf(ReservoirSampler);
    expect(defaultSampler(0)).to.be.instanceOf(ReservoirSampler);
  });
});
