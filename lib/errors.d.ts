/**
 * Type declarations for `lib/errors.js`.
 */
export declare enum HurstifyErrorCode {
  EMPTY_WINDOW = 'E_EMPTY_WINDOW',
  INVALID_BOUNDS = 'E_INVALID_BOUNDS',
  INVALID_SAMPLE_SIZE = 'E_INVALID_SAMPLE_SIZE',
  INVALID_ITERATIONS = 'E_INVALID_ITERATIONS',
  INVALID_BLOCK_SIZE = 'E_INVALID_BLOCK_SIZE',
  INVALID_STEP = 'E_INVALID_STEP',
  WEIGHTS_MISMATCH = 'E_WEIGHTS_MISMATCH',
  OPTIMIZER_FAILURE = 'E_OPTIMIZER_FAILURE',
  OPTIMIZER_NONFINITE = 'E_OPTIMIZER_NONFINITE',
  ALL_ITERATIONS_FAILED = 'E_ALL_ITERATIONS_FAILED',
}

export declare class HurstifyError extends Error {
  constructor(message: string, code: string);
  name: string;
  code: string;
}
