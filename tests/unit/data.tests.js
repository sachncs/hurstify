/**
 * Data pipeline tests.
 */

import {describe, it} from 'mocha';
import {expect} from 'chai';
import {
  parseCsv,
  extractSeries,
  parseJson,
  validateNoGaps,
  downsampleSeries,
  computeRealizedVariance,
  computeRealizedVarianceParkinson,
  aggregateDailyRealizedVariance,
  applyLogTransform,
  centerSeries,
  standardizeSeries,
  applyPreprocessingPipeline,
  splitTrainTest,
  createSlidingWindows,
  generateVixLogVolatility,
  generateSpxLogVolatility,
  generateIntradayPrices,
  seriesToCsv,
} from '../../lib/data/index.js';
import {setRandomSeed, resetRandomSeed} from '../../lib/prng.js';

describe('Data Loaders', function () {
  it('parses simple CSV', function () {
    const csv = 'date,close\n2024-01-01,100\n2024-01-02,101';
    const rows = parseCsv(csv, {numericFields: ['close']});
    expect(rows).to.have.lengthOf(2);
    expect(rows[0].close).to.equal(100);
    expect(rows[1].close).to.equal(101);
  });

  it('parses CSV with quotes', function () {
    const csv =
      'date,name,value\n2024-01-01,"Test, Inc",10\n2024-01-02,Other,20';
    const rows = parseCsv(csv, {numericFields: ['value']});
    expect(rows).to.have.lengthOf(2);
    expect(rows[0].name).to.equal('Test, Inc');
    expect(rows[0].value).to.equal(10);
  });

  it('throws for non-string CSV', function () {
    expect(() => parseCsv(123)).to.throw('csv must be a string');
  });

  it('returns empty array for empty CSV', function () {
    expect(parseCsv('')).to.deep.equal([]);
    expect(parseCsv('   ')).to.deep.equal([]);
  });

  it('throws for non-numeric field', function () {
    const csv = 'date,value\n2024-01-01,abc';
    expect(() => parseCsv(csv, {numericFields: ['value']})).to.throw(
      'Non-numeric value',
    );
  });

  it('throws for invalid date', function () {
    const csv = 'date,value\nnot-a-date,10';
    expect(() => parseCsv(csv, {numericFields: ['value']})).to.throw(
      'Invalid date',
    );
  });

  it('throws for column mismatch', function () {
    const csv = 'date,value\n2024-01-01,10,extra';
    expect(() => parseCsv(csv)).to.throw('columns');
  });

  it('extracts series and sorts by date', function () {
    const rows = [
      {date: new Date('2024-01-02'), close: 101},
      {date: new Date('2024-01-01'), close: 100},
    ];
    const series = extractSeries(rows, 'close', {sortByDate: true});
    expect(series[0].value).to.equal(100);
    expect(series[1].value).to.equal(101);
  });

  it('extracts series without sorting', function () {
    const rows = [
      {date: new Date('2024-01-02'), close: 101},
      {date: new Date('2024-01-01'), close: 100},
    ];
    const series = extractSeries(rows, 'close');
    expect(series[0].value).to.equal(101);
  });

  it('throws for non-array rows', function () {
    expect(() => extractSeries(null, 'close')).to.throw(
      'rows must be an array',
    );
  });

  it('parses valid JSON', function () {
    const data = parseJson('[{"a":1},{"a":2}]');
    expect(data).to.have.lengthOf(2);
    expect(data[0].a).to.equal(1);
  });

  it('returns empty array for empty JSON', function () {
    expect(parseJson('')).to.deep.equal([]);
    expect(parseJson('   ')).to.deep.equal([]);
  });

  it('throws for invalid JSON', function () {
    expect(() => parseJson('not json')).to.throw('Invalid JSON');
  });

  it('throws for non-array JSON', function () {
    expect(() => parseJson('{"a":1}')).to.throw('must be an array');
  });

  it('validates no gaps', function () {
    const series = [
      {date: new Date('2024-01-01')},
      {date: new Date('2024-01-02')},
      {date: new Date('2024-01-03')},
    ];
    const result = validateNoGaps(series, 86400000);
    expect(result.valid).to.equal(true);
  });

  it('detects gaps', function () {
    const series = [
      {date: new Date('2024-01-01')},
      {date: new Date('2024-01-03')},
    ];
    const result = validateNoGaps(series, 86400000);
    expect(result.valid).to.equal(false);
    expect(result.maxGap).to.equal(172800000);
  });

  it('downsamples by averaging', function () {
    const series = [
      {date: new Date('2024-01-01T00:00:00Z'), value: 10},
      {date: new Date('2024-01-01T00:05:00Z'), value: 20},
      {date: new Date('2024-01-01T00:10:00Z'), value: 30},
    ];
    const result = downsampleSeries(series, 600000);
    expect(result).to.have.lengthOf(2);
    expect(result[0].value).to.be.within(14, 16);
  });

  it('throws for invalid downsampleSeries interval', function () {
    expect(() => downsampleSeries([], 0)).to.throw(
      'intervalMs must be positive',
    );
  });
});

describe('Preprocessing', function () {
  it('computes RV from prices', function () {
    const prices = [100, 101, 102, 101, 100];
    const rv = computeRealizedVariance(prices);
    expect(rv).to.be.an('array');
    expect(rv.length).to.be.above(0);
    expect(rv.every((v) => v >= 0)).to.equal(true);
  });

  it('computes RV with interval aggregation', function () {
    const prices = [100, 101, 102, 103, 104];
    const rv = computeRealizedVariance(prices, 2);
    expect(rv).to.be.an('array');
  });

  it('throws for non-array prices', function () {
    expect(() => computeRealizedVariance('bad')).to.throw(
      'prices must be an array',
    );
  });

  it('throws for too-short prices', function () {
    expect(() => computeRealizedVariance([100])).to.throw('at least 2 points');
  });

  it('throws for non-positive prices', function () {
    expect(() => computeRealizedVariance([100, -1])).to.throw(
      'positive finite',
    );
  });

  it('throws for invalid interval', function () {
    expect(() => computeRealizedVariance([100, 101], 0)).to.throw(
      'interval must be a positive integer',
    );
    expect(() => computeRealizedVariance([100, 101], 1.5)).to.throw(
      'interval must be a positive integer',
    );
  });

  it('computes Parkinson RV', function () {
    const bars = [
      {open: 100, high: 102, low: 99, close: 101},
      {open: 101, high: 103, low: 100, close: 102},
    ];
    const rv = computeRealizedVarianceParkinson(bars);
    expect(rv).to.have.lengthOf(2);
    expect(rv.every((v) => v >= 0)).to.equal(true);
  });

  it('returns empty for empty bars', function () {
    expect(computeRealizedVarianceParkinson([])).to.deep.equal([]);
  });

  it('throws for invalid bar values', function () {
    expect(() =>
      computeRealizedVarianceParkinson([{high: -1, low: 1}]),
    ).to.throw('positive finite');
  });

  it('aggregates daily RV', function () {
    expect(aggregateDailyRealizedVariance([0.1, 0.2, 0.3])).to.be.closeTo(
      0.6,
      1e-10,
    );
    expect(aggregateDailyRealizedVariance([])).to.equal(0);
  });

  it('log-transforms RV', function () {
    const rv = [1, Math.E, Math.E * Math.E];
    const logVol = applyLogTransform(rv);
    expect(logVol[0]).to.equal(0);
    expect(logVol[1]).to.be.closeTo(0.5, 1e-10);
    expect(logVol[2]).to.be.closeTo(1, 1e-10);
  });

  it('throws for invalid RV values', function () {
    expect(() => applyLogTransform([0])).to.throw('positive finite');
    expect(() => applyLogTransform([-1])).to.throw('positive finite');
  });

  it('centers a series', function () {
    const series = [1, 2, 3, 4, 5];
    const centered = centerSeries(series);
    const mean = centered.reduce((a, b) => a + b, 0) / centered.length;
    expect(mean).to.be.closeTo(0, 1e-10);
  });

  it('returns empty for empty center', function () {
    expect(centerSeries([])).to.deep.equal([]);
  });

  it('standardizes a series', function () {
    const series = [1, 2, 3, 4, 5];
    const std = standardizeSeries(series);
    const mean = std.reduce((a, b) => a + b, 0) / std.length;
    const variance = std.reduce((sum, v) => sum + v * v, 0) / std.length;
    expect(mean).to.be.closeTo(0, 1e-10);
    expect(variance).to.be.closeTo(1, 1e-10);
  });

  it('throws for too-short standardize', function () {
    expect(() => standardizeSeries([1])).to.throw('at least 2 points');
  });

  it('throws for zero variance', function () {
    expect(() => standardizeSeries([1, 1, 1])).to.throw('zero variance');
  });

  it('runs full preprocessing pipeline', function () {
    const prices = Array.from({length: 100}, (_, i) => 100 + i * 0.1);
    const result = applyPreprocessingPipeline(prices, {
      interval: 5,
      center: true,
    });
    expect(result).to.be.an('array');
    expect(result.length).to.be.above(0);
    const mean = result.reduce((a, b) => a + b, 0) / result.length;
    expect(mean).to.be.closeTo(0, 1e-10);
  });

  it('splits train/test', function () {
    const series = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const {train, test} = splitTrainTest(series, 0.8);
    expect(train).to.have.lengthOf(8);
    expect(test).to.have.lengthOf(2);
    expect(train[train.length - 1]).to.equal(8);
    expect(test[0]).to.equal(9);
  });

  it('throws for invalid train ratio', function () {
    expect(() => splitTrainTest([1, 2], 0)).to.throw('in (0, 1)');
    expect(() => splitTrainTest([1, 2], 1)).to.throw('in (0, 1)');
  });

  it('creates overlapping windows', function () {
    const series = [1, 2, 3, 4, 5];
    const windows = createSlidingWindows(series, 3, 1);
    expect(windows).to.have.lengthOf(3);
    expect(windows[0]).to.deep.equal([1, 2, 3]);
    expect(windows[1]).to.deep.equal([2, 3, 4]);
    expect(windows[2]).to.deep.equal([3, 4, 5]);
  });

  it('creates non-overlapping windows', function () {
    const series = [1, 2, 3, 4, 5, 6];
    const windows = createSlidingWindows(series, 3, 3);
    expect(windows).to.have.lengthOf(2);
  });

  it('throws for invalid window params', function () {
    expect(() => createSlidingWindows([1], 0, 1)).to.throw(
      'windowSize must be positive',
    );
    expect(() => createSlidingWindows([1], 1, 0)).to.throw(
      'step must be positive',
    );
  });
});

describe('Synthetic Data', function () {
  this.timeout(10000);

  it('generates VIX-style log-vol', function () {
    setRandomSeed(1);
    const vol = generateVixLogVolatility(500, 0.1, {seed: 1});
    expect(vol).to.have.lengthOf(500);
    expect(vol.every((v) => Number.isFinite(v))).to.equal(true);
    resetRandomSeed();
  });

  it('generates SPX-style log-vol', function () {
    setRandomSeed(2);
    const vol = generateSpxLogVolatility(500, 0.14, {seed: 2});
    expect(vol).to.have.lengthOf(500);
    expect(vol.every((v) => Number.isFinite(v))).to.equal(true);
    resetRandomSeed();
  });

  it('returns empty for nDays=0', function () {
    expect(generateVixLogVolatility(0)).to.deep.equal([]);
    expect(generateSpxLogVolatility(0)).to.deep.equal([]);
  });

  it('throws for invalid H', function () {
    expect(() => generateVixLogVolatility(10, 0)).to.throw(
      'h must be in (0, 1)',
    );
    expect(() => generateSpxLogVolatility(10, 1)).to.throw(
      'h must be in (0, 1)',
    );
  });

  it('generates intraday prices', function () {
    setRandomSeed(3);
    const days = generateIntradayPrices(78, 2, 0.1, {seed: 3});
    expect(days).to.have.lengthOf(2);
    expect(days[0]).to.have.lengthOf(78);
    expect(days[0][0]).to.equal(100);
    expect(days[0].every((p) => p > 0)).to.equal(true);
    resetRandomSeed();
  });

  it('returns empty for zero intraday', function () {
    expect(generateIntradayPrices(0, 1, 0.1)).to.deep.equal([]);
    expect(generateIntradayPrices(10, 0, 0.1)).to.deep.equal([]);
  });

  it('throws for invalid H in intraday', function () {
    expect(() => generateIntradayPrices(10, 1, 0)).to.throw(
      'h must be in (0, 1)',
    );
  });

  it('exports series to CSV', function () {
    const series = [
      {date: new Date('2024-01-01'), value: 100},
      {date: new Date('2024-01-02'), value: 101},
    ];
    const csv = seriesToCsv(series);
    expect(csv).to.include('date,value');
    expect(csv).to.include('2024-01-01,100');
    expect(csv).to.include('2024-01-02,101');
  });

  it('exports series with custom headers', function () {
    const series = [{date: '2024-01-01', value: 100}];
    const csv = seriesToCsv(series, 'time', 'price');
    expect(csv).to.include('time,price');
  });

  it('throws for non-array in seriesToCsv', function () {
    expect(() => seriesToCsv(null)).to.throw('series must be an array');
  });
});
