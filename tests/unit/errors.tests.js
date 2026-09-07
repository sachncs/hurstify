/**
 * HurstifyError unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {HurstifyError, HurstifyErrorCode} from '../../lib/errors.js';
import {Hurstify} from '../../lib/hurstify.js';

describe('HurstifyError', function () {
  it('captures the code and message', function () {
    const err = new HurstifyError('boom', HurstifyErrorCode.EMPTY_WINDOW);
    expect(err).to.be.instanceOf(Error);
    expect(err.code).to.equal('E_EMPTY_WINDOW');
    expect(err.message).to.equal('boom');
    expect(err.name).to.equal('HurstifyError');
  });

  it('is thrown for invalid constructor configuration', function () {
    expect(() => new Hurstify({hMin: 0.5, hMax: 0.2}))
      .to.throw(HurstifyError, /hMin/)
      .with.property('code', HurstifyErrorCode.INVALID_BOUNDS);
    expect(() => new Hurstify({iterations: 0})).to.throw(HurstifyError);
    expect(() => new Hurstify({sampleSize: 0})).to.throw(HurstifyError);
  });

  it('is thrown for empty-window estimateSingle', function () {
    const h = new Hurstify();
    expect(() => h.estimateSingle([]))
      .to.throw(HurstifyError, /non-empty/)
      .with.property('code', HurstifyErrorCode.EMPTY_WINDOW);
  });
});
