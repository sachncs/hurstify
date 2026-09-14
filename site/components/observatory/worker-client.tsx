'use client';

import * as React from 'react';
import type {WorkerMessage, WorkerRequest} from '@/lib/worker-protocol';

let counter = 0;

type PendingJob = {
  resolve: (result: unknown) => void;
  reject: (err: Error) => void;
  onProgress?: (p: number) => void;
};

class WorkerClient {
  private worker: Worker | null = null;
  private pending = new Map<number, PendingJob>();

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      });
      this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
        const {type, id, ...rest} = e.data as WorkerMessage & {
          id: number;
        };
        const job = this.pending.get(id);
        if (!job) return;
        if (type === 'progress') {
          job.onProgress?.((rest as {progress: number}).progress);
          return;
        }
        if (type === 'complete') {
          this.pending.delete(id);
          job.resolve((rest as {result: unknown}).result);
          return;
        }
        if (type === 'error') {
          this.pending.delete(id);
          job.reject(new Error((rest as {message: string}).message));
        }
      };
    }
    return this.worker;
  }

  dispatch<T>(
    req: WorkerRequest,
    onProgress?: (p: number) => void,
  ): Promise<T> {
    const id = ++counter;
    const w = this.getWorker();
    return new Promise((resolve, reject) => {
      this.pending.set(id, {
        resolve: resolve as (r: unknown) => void,
        reject,
        onProgress,
      });
      w.postMessage({...req, id});
    });
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
  }
}

export const workerClient = new WorkerClient();

export function useWorker() {
  return workerClient;
}
