/**
 * Forecasting model strategy tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  ArfimaForecaster,
  HoltWintersForecaster,
  LstmForecaster,
  AttentionForecaster,
  getForecaster,
  listForecasters,
} from '../../lib/models/index.js';

describe('ArfimaForecaster', function () {
  it('produces a forecast within bounds', function () {
    const forecaster = new ArfimaForecaster({p: 1, d: 0.3, q: 1, window: 10});
    const series = [0.1, 0.2, 0.15];
    const val = forecaster.predict(series);
    expect(val).to.be.within(0.01, 0.99);
  });

  it('returns mean for short series', function () {
    const forecaster = new ArfimaForecaster({window: 10});
    const series = [0.1, 0.2, 0.15];
    const val = forecaster.predict(series);
    expect(val).to.be.closeTo(0.15, 1e-6);
  });

  it('returns bounded prediction for longer series', function () {
    const forecaster = new ArfimaForecaster({window: 5});
    const series = Array.from({length: 20}, () => 0.1 + Math.random() * 0.05);
    const val = forecaster.predict(series);
    expect(val).to.be.within(0.01, 0.99);
  });
});

describe('HoltWintersForecaster', function () {
  it('produces a forecast', function () {
    const forecaster = new HoltWintersForecaster({alpha: 0.3, beta: 0.1});
    const series = [1, 2, 3, 4, 5];
    const forecast = forecaster.predict(series);
    expect(forecast).to.be.a('number');
    expect(forecast).to.be.above(0);
  });

  it('throws for empty series', function () {
    const forecaster = new HoltWintersForecaster();
    expect(() => forecaster.predict([])).to.throw('series must be non-empty');
  });

  it('validates alpha in [0,1] on predict', function () {
    const forecaster = new HoltWintersForecaster();
    forecaster.alpha = -0.1;
    expect(() => forecaster.predict([1, 2])).to.throw(
      'alpha must be in [0, 1]',
    );
    forecaster.alpha = 1.1;
    expect(() => forecaster.predict([1, 2])).to.throw(
      'alpha must be in [0, 1]',
    );
  });
});

describe('LstmForecaster', function () {
  it('creates a predictor with predict method', function () {
    const forecaster = new LstmForecaster({hiddenSize: 8});
    expect(forecaster.predict).to.be.a('function');
  });

  it('produces a finite scalar prediction', function () {
    const forecaster = new LstmForecaster({hiddenSize: 8});
    const prediction = forecaster.predict([0.1, 0.2, 0.3, 0.4]);
    expect(prediction).to.be.a('number');
    expect(Number.isFinite(prediction)).to.equal(true);
  });

  it('throws for empty series', function () {
    const forecaster = new LstmForecaster();
    expect(() => forecaster.predict([])).to.throw('series must be non-empty');
  });
});

describe('AttentionForecaster', function () {
  it('creates a predictor with predict method', function () {
    const forecaster = new AttentionForecaster({hiddenSize: 8});
    expect(forecaster.predict).to.be.a('function');
  });

  it('produces a finite scalar prediction', function () {
    const forecaster = new AttentionForecaster({hiddenSize: 8});
    const prediction = forecaster.predict([0.1, 0.2, 0.3, 0.4]);
    expect(prediction).to.be.a('number');
    expect(Number.isFinite(prediction)).to.equal(true);
  });

  it('throws for empty series', function () {
    const forecaster = new AttentionForecaster();
    expect(() => forecaster.predict([])).to.throw('series must be non-empty');
  });
});

describe('Forecaster Registry', function () {
  it('lists built-in forecasters', function () {
    const list = listForecasters();
    expect(list).to.include('arfima');
    expect(list).to.include('holtWinters');
    expect(list).to.include('lstm');
    expect(list).to.include('attention');
  });

  it('retrieves forecasters by name', function () {
    const fc = getForecaster('arfima');
    expect(fc).to.be.instanceOf(ArfimaForecaster);
  });
});
