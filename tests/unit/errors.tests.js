/**
 * HurstifyError unit tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {HurstifyError, HurstifyErrorCode} from '../../lib/errors.js';
import {Hurstify} from '../../lib/hurstify.js';
import {Sampler} from '../../lib/strategies/sampler.js';
import {KsObjective} from '../../lib/strategies/ks-objective.js';
import {Kernel} from '../../lib/strategies/kernel.js';
import {Forecaster} from '../../lib/strategies/forecaster.js';
import {StochasticModel} from '../../lib/strategies/model.js';
import {Optimizer} from '../../lib/optimization/optimizer.js';
import {HypothesisTest} from '../../lib/strategies/hypothesis-test.js';

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

describe('strategy base classes throw HurstifyError', function () {
  it('Sampler.draw throws HurstifyError', function () {
    expect(() => new Sampler().draw([1, 2, 3], 2))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('KsObjective.evaluate throws HurstifyError', function () {
    expect(() => new KsObjective().evaluate([], [1, 2], 0.5))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('Kernel.evaluate throws HurstifyError', function () {
    expect(() => new Kernel().evaluate(1))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('Forecaster.predict throws HurstifyError', function () {
    expect(() => new Forecaster().predict([0.1, 0.2]))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('StochasticModel.simulate throws HurstifyError', function () {
    expect(() => new StochasticModel().simulate({}))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('StochasticModel.price throws HurstifyError', function () {
    expect(() => new StochasticModel().price({paths: [new Float64Array(1)]}))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('HypothesisTest.run throws HurstifyError', function () {
    expect(() => new HypothesisTest().run([], {}))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });

  it('Optimizer.minimize throws HurstifyError', function () {
    expect(() => new Optimizer().minimize((x) => x, 0, 1, 0.5))
      .to.throw(HurstifyError)
      .with.property('code', HurstifyErrorCode.ABSTRACT_NOT_IMPLEMENTED);
  });
});
