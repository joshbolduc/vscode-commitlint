import type { IpcRequest } from '../ipcTypes';
import { log } from '../log';
import { IpcWorker } from './IpcWorker';

class WorkerManager {
  private worker: Promise<IpcWorker> | undefined;

  public send<T extends IpcRequest>(message: T) {
    return this.ensureWorker().then((worker) => worker.send(message));
  }

  private ensureWorker() {
    if (!this.worker) {
      this.worker = IpcWorker.create(() => {
        this.reset();
      });

      this.worker.catch((e) => {
        log(`Failed to create worker: ${String(e)}`);
      });
    }
    return this.worker;
  }

  private reset() {
    this.worker = undefined;
  }

  public dispose() {
    this.worker
      ?.then((worker) => worker.terminate())
      .catch((e) => {
        log(`Failed to terminate worker: ${String(e)}`);
      });
    this.reset();
  }
}

let workerManager: WorkerManager | undefined;

const initWorkerManager = () => {
  workerManager = new WorkerManager();
  return workerManager;
};

export const ensureWorkerManager = () => {
  workerManager ??= initWorkerManager();

  return workerManager;
};

export const disposeWorkerManager = () => {
  workerManager?.dispose();
};
