/**
 * Random generation tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  nextGaussian,
  generateGaussianBatch,
  generateCorrelatedGaussian,
  generateFractionalNoise,
  generateFractionalBrownianMotion,
  computeFractionalKernel,
  computeFractionalIntegral,
} from '../../lib/stochastic-generators.js';
import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';

describe('nextGaussian', function () {
  it('produces standard normal variates', function () {
    setRandomSeed(1);
    const samples = [];
    for (let i = 0; i < 1000; i++) samples.push(nextGaussian());
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance =
      samples.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) /
      samples.length;
    expect(mean).to.be.closeTo(0, 0.1);
    expect(variance).to.be.closeTo(1, 0.2);
    resetRandomSeed();
  });
});

describe('generateGaussianBatch', function () {
  it('returns correct length', function () {
    const batch = generateGaussianBatch(100);
    expect(batch).to.have.lengthOf(100);
    expect(batch).to.be.instanceOf(Float64Array);
  });
});

describe('generateCorrelatedGaussian', function () {
  it('produces correlated normals', function () {
    setRandomSeed(2);
    const [z1, z2] = generateCorrelatedGaussian(5000, 0.8);
    const mean1 = z1.reduce((a, b) => a + b, 0) / z1.length;
    const mean2 = z2.reduce((a, b) => a + b, 0) / z2.length;
    const cov =
      z1
        .map((v, i) => (v - mean1) * (z2[i] - mean2))
        .reduce((a, b) => a + b, 0) / z1.length;
    const var1 =
      z1.map((v) => (v - mean1) ** 2).reduce((a, b) => a + b, 0) / z1.length;
    const var2 =
      z2.map((v) => (v - mean2) ** 2).reduce((a, b) => a + b, 0) / z2.length;
    const rhoEst = cov / Math.sqrt(var1 * var2);
    expect(rhoEst).to.be.closeTo(0.8, 0.05);
    resetRandomSeed();
  });
});

describe('generateFractionalNoise', function () {
  it('generates correct length', function () {
    const fgn = generateFractionalNoise(100, 0.3);
    expect(fgn).to.have.lengthOf(100);
    expect(fgn).to.be.instanceOf(Float64Array);
  });

  it('throws for invalid H', function () {
    expect(() => generateFractionalNoise(100, 0)).to.throw(
      'H must satisfy 0 < H < 1',
    );
    expect(() => generateFractionalNoise(100, 1)).to.throw(
      'H must satisfy 0 < H < 1',
    );
    expect(() => generateFractionalNoise(100, -0.1)).to.throw(
      'H must satisfy 0 < H < 1',
    );
  });

  it('throws for invalid n', function () {
    expect(() => generateFractionalNoise(0, 0.5)).to.throw(
      'n must be a positive finite integer',
    );
    expect(() => generateFractionalNoise(-1, 0.5)).to.throw(
      'n must be a positive finite integer',
    );
  });

  it('has zero mean approximately', function () {
    setRandomSeed(3);
    const fgn = generateFractionalNoise(2000, 0.5);
    const mean = fgn.reduce((a, b) => a + b, 0) / fgn.length;
    expect(mean).to.be.closeTo(0, 0.1);
    resetRandomSeed();
  });
});

describe('generateFractionalBrownianMotion', function () {
  it('generates correct length', function () {
    const fbm = generateFractionalBrownianMotion(100, 0.5);
    expect(fbm).to.have.lengthOf(100);
  });

  it('starts at zero', function () {
    const fbm = generateFractionalBrownianMotion(100, 0.5);
    expect(fbm[0]).to.equal(0);
  });

  it('returns empty array for n <= 0', function () {
    expect(generateFractionalBrownianMotion(0, 0.5)).to.have.lengthOf(0);
  });
});

describe('computeFractionalKernel', function () {
  it('returns correct length', function () {
    const k = computeFractionalKernel(0.3, 50, 0.01);
    expect(k).to.have.lengthOf(50);
    expect(k).to.be.instanceOf(Float64Array);
  });

  it('has positive values', function () {
    const k = computeFractionalKernel(0.3, 10, 0.01);
    expect(k.every((v) => v > 0)).to.equal(true);
  });
});

describe('computeFractionalIntegral', function () {
  it('computes integral for t=1', function () {
    const dW = new Float64Array([1, 0, 0]);
    const kernel = new Float64Array([1, 0, 0]);
    const val = computeFractionalIntegral(dW, kernel, 1);
    expect(val).to.equal(1);
  });
});
