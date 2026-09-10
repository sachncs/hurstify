import {strict as assert} from 'node:assert';
import {describe, it} from 'mocha';
import {
  Hurstify,
  RoughBergomiModel,
  RoughFsvModel,
  generateFractionalBrownianMotion,
} from '../../lib/index.js';

describe('integration: end-to-end Hurst estimate', () => {
  it('recovers known H from a long fBm path within tolerance', () => {
    const trueH = 0.1;
    const path = generateFractionalBrownianMotion(2000, trueH);
    const r = new Hurstify({
      scaleA1: 1,
      scaleA2: 25,
      sampleSize: 500,
      iterations: 8,
    });
    const H = r.estimateSingle(path);
    assert.ok(Math.abs(H - trueH) < 0.1, `H = ${H} too far from true ${trueH}`);
  });

  it('produces finite positive price paths for RoughBergomiModel', () => {
    const sim = new RoughBergomiModel().simulate({nPaths: 1, nSteps: 50});
    const priced = new RoughBergomiModel().price(sim);
    assert.ok(
      priced.prices[0].every((v) => Number.isFinite(v) && v > 0),
      'RoughBergomiModel.price returned NaN paths',
    );
  });

  it('produces finite positive price paths for RoughFsvModel', () => {
    const sim = new RoughFsvModel().simulate({nSteps: 50});
    const priced = new RoughFsvModel().price(sim);
    assert.ok(
      priced.prices[0].every((v) => Number.isFinite(v) && v > 0),
      'RoughFsvModel.price returned NaN paths',
    );
  });
});
