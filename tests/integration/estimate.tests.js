import {strict as assert} from 'node:assert';
import {describe, it} from 'mocha';
import {Hurstify, generateFractionalBrownianMotion} from '../../lib/index.js';

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
});
