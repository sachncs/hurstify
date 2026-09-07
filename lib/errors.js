/**
 * @fileoverview Domain-specific error class for hurstify.
 *
 * Every hurstify-level failure (empty windows, optimizer divergence,
 * invalid configuration, etc.) should be raised as a `HurstifyError`
 * with a stable machine-readable `code` so that production consumers can
 * branch on the failure type without parsing error messages.
 */

/**
 * Stable error codes. Treat the string values as part of the public
 * API — renaming them is a breaking change.
 *
 * @enum {string}
 */
export const HurstifyErrorCode = {
  EMPTY_WINDOW: 'E_EMPTY_WINDOW',
  INVALID_BOUNDS: 'E_INVALID_BOUNDS',
  INVALID_SAMPLE_SIZE: 'E_INVALID_SAMPLE_SIZE',
  INVALID_ITERATIONS: 'E_INVALID_ITERATIONS',
  INVALID_BLOCK_SIZE: 'E_INVALID_BLOCK_SIZE',
  INVALID_STEP: 'E_INVALID_STEP',
  WEIGHTS_MISMATCH: 'E_WEIGHTS_MISMATCH',
  OPTIMIZER_FAILURE: 'E_OPTIMIZER_FAILURE',
  OPTIMIZER_NONFINITE: 'E_OPTIMIZER_NONFINITE',
  ALL_ITERATIONS_FAILED: 'E_ALL_ITERATIONS_FAILED',
};

/**
 * hurstify-specific error with a stable `code` field.
 *
 * @extends Error
 */
export class HurstifyError extends Error {
  /**
   * @param {string} message Human-readable error message.
   * @param {string} code One of {@link HurstifyErrorCode}.
   */
  constructor(message, code) {
    super(message);
    this.name = 'HurstifyError';
    this.code = code;
  }
}
