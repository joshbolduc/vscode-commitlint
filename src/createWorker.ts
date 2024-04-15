import { resolve } from 'node:path';
import { Worker } from 'node:worker_threads';

export const createWorker = () => {
  return new Worker(resolve(__dirname, 'worker', 'index.js'));
};
