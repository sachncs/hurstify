/**
 * Typed message protocol shared between the worker and the React client.
 * Mirrors the legacy `cmd/payload` shape but with discriminated unions for safety.
 */

export type GenerateCmd = {
  cmd: 'generate';
  payload: {
    model: 'fBM' | 'rBergomi' | 'rFSV' | 'fOU' | 'mPRE';
    nSteps: number;
    h: number;
    seed: number;
  };
};

export type SingleCmd = {
  cmd: 'single';
  payload: {
    path: number[];
    config: Record<string, unknown>;
  };
};

export type RollingCmd = {
  cmd: 'rolling';
  payload: {
    path: number[];
    windowSize: number;
    step: number;
    config: Record<string, unknown>;
  };
};

export type ExplorerCmd = {
  cmd: 'explorer';
  payload: {
    trueHs: number[];
    windowSizes: number[];
    optimizers: string[];
    nTrials: number;
    pathLength: number;
    configBase: Record<string, unknown>;
  };
};

export type WorkerRequest = GenerateCmd | SingleCmd | RollingCmd | ExplorerCmd;

export type WorkerProgress = {
  type: 'progress';
  id: number;
  progress: number;
};

export type WorkerComplete<T> = {
  type: 'complete';
  id: number;
  result: T;
};

export type WorkerError = {
  type: 'error';
  id: number;
  message: string;
};

export type WorkerMessage<T = unknown> =
  WorkerProgress | WorkerComplete<T> | WorkerError;
