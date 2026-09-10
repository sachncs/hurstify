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
  ABSTRACT_NOT_IMPLEMENTED: 'E_ABSTRACT_NOT_IMPLEMENTED',
  INVALID_KERNEL_INPUT: 'E_INVALID_KERNEL_INPUT',
  INVALID_MODEL_INPUT: 'E_INVALID_MODEL_INPUT',
  INVALID_OPTIMIZER_BOUNDS: 'E_INVALID_OPTIMIZER_BOUNDS',
  INVALID_DATA_SHAPE: 'E_INVALID_DATA_SHAPE',
  INVALID_FORECASTER_INPUT: 'E_INVALID_FORECASTER_INPUT',
  INVALID_KS_OBJECTIVE_INPUT: 'E_INVALID_KS_OBJECTIVE_INPUT',
  INVALID_SAMPLER_INPUT: 'E_INVALID_SAMPLER_INPUT',
  INVALID_HYPOTHESIS_TEST_INPUT: 'E_INVALID_HYPOTHESIS_TEST_INPUT',
  INVALID_REGISTRY_INPUT: 'E_INVALID_REGISTRY_INPUT',
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
