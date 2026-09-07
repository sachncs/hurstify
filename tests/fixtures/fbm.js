/**
 * Shared test fixtures for hurstify tests.
 * Reusable paths and seeds exercised across test suites.
 */

import {
  generateFractionalBrownianMotion,
  setRandomSeed,
  resetRandomSeed,
} from '../../lib/index.js';

export function fixtureFBM(n = 1000, h = 0.1) {
  setRandomSeed(42);
  const p = generateFractionalBrownianMotion(n, h);
  resetRandomSeed();
  return p;
}

export const FIXTURE_H = 0.1;
export const FIXTURE_N = 1000;
