/**
 * Type declarations for the data pipeline layer.
 */

export interface ParseOptions {
  dateField?: string;
  numericFields?: string[];
}

export interface DataPoint {
  date: Date;
  value: number;
}

export interface SeriesRow {
  [key: string]: string | number | Date;
}

export interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PreprocessOptions {
  interval?: number;
  center?: boolean;
}

export interface IntradayPricesOptions {
  seed?: number;
  noiseStd?: number;
  drift?: number;
}

export interface NoiseOptions {
  windowSize?: number;
  kernelType?: 'bartlett' | 'parzen' | 'tukey-hanning';
  bandwidth?: number | null;
}

export declare function parseCsv(csv: string, opts?: ParseOptions): SeriesRow[];

export declare function extractSeries(
  rows: SeriesRow[],
  field: string,
  opts?: {sortByDate?: boolean; dateField?: string},
): DataPoint[];

export declare function parseJson(json: string): unknown[];

export declare function validateNoGaps(
  series: DataPoint[],
  maxGapMs: number,
): {valid: boolean; maxGap: number; gaps: number[]};

export declare function downsampleSeries(
  series: DataPoint[],
  intervalMs: number,
): DataPoint[];

export declare function computeRealizedVariance(
  prices: number[],
  interval?: number,
): number[];

export declare function computeRealizedVarianceParkinson(bars: Bar[]): number[];

export declare function aggregateDailyRealizedVariance(
  intradayRVs: number[],
): number;

export declare function applyLogTransform(rv: number[]): number[];

export declare function centerSeries(series: number[]): number[];

export declare function standardizeSeries(series: number[]): number[];

export declare function applyPreprocessingPipeline(
  prices: number[],
  opts?: PreprocessOptions,
): number[];

export declare function splitTrainTest<T>(
  series: T[],
  trainRatio?: number,
): {train: T[]; test: T[]};

export declare function createSlidingWindows<T>(
  series: T[],
  windowSize: number,
  step?: number,
): T[][];

export declare function generateVixLogVolatility(
  nDays: number,
  h?: number,
  opts?: IntradayPricesOptions,
): number[];

export declare function generateSpxLogVolatility(
  nDays: number,
  h?: number,
  opts?: IntradayPricesOptions,
): number[];

export declare function generateIntradayPrices(
  nIntraday?: number,
  nDays?: number,
  h?: number,
  opts?: IntradayPricesOptions,
): number[][];

export declare function seriesToCsv(
  series: DataPoint[],
  dateHeader?: string,
  valueHeader?: string,
): string;

export declare function preaverageReturns(
  prices: number[],
  windowSize?: number,
): number[];

export declare function computeRealizedKernel(
  returns: number[],
  kernelType?: 'bartlett' | 'parzen' | 'tukey-hanning',
  bandwidth?: number | null,
): number;

export declare function debiasLogVolatility(
  rawHEstimates: number[],
  sigmaObs: number,
  sigmaLatent: number,
): number[];
