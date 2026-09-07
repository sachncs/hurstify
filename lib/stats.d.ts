/**
 * Type declarations for `lib/stats.js`.
 */

export declare function computeKsDistance(
  s1: number[] | Float64Array,
  s2: number[] | Float64Array,
  isSorted?: boolean,
): number;

export declare function shuffleArray<T>(arr: T[]): T[];

export declare function getRandomSample<T>(arr: T[], n: number): T[];

export declare function permuteBlocks(
  arr: number[] | Float64Array,
  blockSize: number,
  randomPhase?: boolean,
): number[];
