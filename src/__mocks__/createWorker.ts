import { Worker } from 'node:worker_threads';

export const createWorker = () => {
  return new Worker(new URL('./../../dist/worker/index.js', import.meta.url));
};
