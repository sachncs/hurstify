/// <reference lib="webworker" />
import {
  Hurstify,
  generateFractionalBrownianMotion,
  RoughBergomiModel,
  RoughFsvModel,
  EulerMaruyamaFractionalOuModel,
  LocalHolderMultifractionalPreModel,
  KsSignificanceTest,
  setRandomSeed,
  resetRandomSeed,
  getStandardError,
  getConfidenceInterval,
} from '../../../lib/index.js';
import type {WorkerRequest, WorkerMessage} from '@/lib/worker-protocol';

declare const self: DedicatedWorkerGlobalScope;

const rBergomiModel = new RoughBergomiModel();
const rFsvModel = new RoughFsvModel();
const fOuModel = new EulerMaruyamaFractionalOuModel();
const mpreModel = new LocalHolderMultifractionalPreModel();
const ksSignificance = new KsSignificanceTest();

/**
 * Generates a synthetic path using the requested model strategy.
 *
 * @param {Object} opts Generation options.
 * @return {number[]} Generated path.
 */
function generatePath(opts: {
  model: string;
  nSteps: number;
  h: number;
  seed: number;
}): number[] {
  setRandomSeed(opts.seed || 42);
  let path: number[];
  switch (opts.model) {
    case 'rBergomi': {
      const sim = rBergomiModel.simulate({
        nPaths: 1,
        nSteps: opts.nSteps,
        h: opts.h,
      });
      path = Array.from(
        rBergomiModel.price(sim, {nSteps: opts.nSteps, h: opts.h}).prices[0],
      );
      break;
    }
    case 'rFSV': {
      const sim = rFsvModel.simulate({nSteps: opts.nSteps, h: opts.h});
      path = Array.from(
        rFsvModel.price(sim, {nSteps: opts.nSteps, h: opts.h}).prices[0],
      );
      break;
    }
    case 'fOU': {
      const sim = fOuModel.simulate({nSteps: opts.nSteps, h: opts.h});
      path = Array.from(sim.paths[0]);
      break;
    }
    case 'mPRE': {
      const sim = mpreModel.simulate({
        nSteps: opts.nSteps,
        hMin: 0.05,
        hMax: 0.95,
        h0: opts.h,
      });
      path = Array.from(sim.paths[0]);
      break;
    }
    default:
      path = Array.from(generateFractionalBrownianMotion(opts.nSteps, opts.h));
  }
  resetRandomSeed();
  return path;
}

self.onmessage = (e: MessageEvent<WorkerRequest & {id: number}>) => {
  const {id, cmd, payload} = e.data;
  try {
    switch (cmd) {
      case 'generate': {
        const path = generatePath(payload);
        post({type: 'complete', id, result: {path}});
        return;
      }
      case 'single': {
        const estimator = new Hurstify(payload.config);
        const {H, minimizedD} = estimator.estimateSingleWithDiagnostics(
          payload.path,
        );
        const n =
          ((payload.config as Record<string, unknown>).sampleSize as number) ||
          500;
        const sig = ksSignificance.run({D: minimizedD, n, m: n}, {alpha: 0.05});
        const se = getStandardError(
          ((payload.config as Record<string, unknown>).scaleA1 as number) || 1,
          ((payload.config as Record<string, unknown>).scaleA2 as number) || 25,
          n,
          n,
        );
        const ci = getConfidenceInterval(
          H,
          ((payload.config as Record<string, unknown>).scaleA1 as number) || 1,
          ((payload.config as Record<string, unknown>).scaleA2 as number) || 25,
          n,
          n,
          0.05,
        );
        post({
          type: 'complete',
          id,
          result: {H, minimizedD, significance: sig, se, ci},
        });
        return;
      }
      case 'rolling': {
        const estimator = new Hurstify(payload.config);
        const results = estimator.rolling(
          payload.path,
          payload.windowSize,
          payload.step || 1,
          (progress: number) => post({type: 'progress', id, progress}),
        );
        post({type: 'complete', id, result: {results}});
        return;
      }
      case 'explorer': {
        const {
          trueHs,
          windowSizes,
          optimizers,
          nTrials,
          pathLength,
          configBase,
        } = payload;
        const results: Array<{
          trueH: number;
          windowSize: number;
          optimizer: string;
          rmse: number;
          bias: number;
          failRate: number;
          avgTime: number;
        }> = [];
        let completed = 0;
        const total =
          trueHs.length * windowSizes.length * optimizers.length * nTrials;

        for (const trueH of trueHs) {
          for (const w of windowSizes) {
            for (const opt of optimizers) {
              const errors: number[] = [];
              const times: number[] = [];
              for (let t = 0; t < nTrials; t++) {
                const path = generatePath({
                  model: 'fBM',
                  nSteps: pathLength,
                  h: trueH,
                  seed: t + 1,
                });
                const cfg = {
                  ...configBase,
                  optimizerType: opt as
                    'brent' | 'nelder-mead' | 'annealing' | 'de' | 'ags',
                  sampleSize: Math.min(500, w),
                };
                const estimator = new Hurstify(cfg);
                const t0 = performance.now();
                try {
                  const H = estimator.estimateSingle(path.slice(0, w));
                  errors.push(H - trueH);
                } catch {
                  errors.push(NaN);
                }
                times.push(performance.now() - t0);
                completed++;
                post({
                  type: 'progress',
                  id,
                  progress: completed / total,
                });
              }
              const valid = errors.filter((e) => Number.isFinite(e));
              results.push({
                trueH,
                windowSize: w,
                optimizer: opt,
                rmse: valid.length
                  ? Math.sqrt(
                      valid.reduce((a, b) => a + b * b, 0) / valid.length,
                    )
                  : NaN,
                bias: valid.length
                  ? valid.reduce((a, b) => a + b, 0) / valid.length
                  : NaN,
                failRate: (nTrials - valid.length) / nTrials,
                avgTime: times.reduce((a, b) => a + b, 0) / times.length,
              });
            }
          }
        }
        post({type: 'complete', id, result: {results}});
        return;
      }
      default:
        post({type: 'error', id, message: `Unknown command: ${cmd}`});
    }
  } catch (err) {
    post({
      type: 'error',
      id,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

/**
 * Posts a typed message to the worker host.
 *
 * @param {WorkerMessage} msg Typed message.
 */
function post(msg: WorkerMessage) {
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg);
}
