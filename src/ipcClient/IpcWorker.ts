import type { Worker } from 'node:worker_threads';
import { createWorker } from '../createWorker';
import type {
  Envelope,
  IpcRequest,
  IpcResponse,
  IpcServerToClientMessage,
  MessageId,
  ResponseTypeFromName,
} from '../ipcTypes';
import { log } from '../log';

interface Resolvers {
  resolve: (result: IpcResponse) => void;
  reject: (err: Error) => void;
}

const withResolvers = <T>() => {
  let resolve: (res: T) => void;
  let reject: (err: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    resolve: resolve!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    reject: reject!,
  };
};

export class IpcWorker {
  private nextMessageId = 0;
  private resolversMap = new Map<MessageId, Resolvers>();

  public static create(onDisconnect: () => void): Promise<IpcWorker> {
    const worker = createWorker();

    return new Promise<IpcWorker>((resolve, reject) => {
      worker.on('online', () => {
        resolve(new IpcWorker(worker, onDisconnect));
      });

      worker.on('error', () => {
        reject();
      });

      worker.on('exit', () => {
        reject();
      });
    });
  }

  public constructor(
    private readonly worker: Worker,
    private readonly onDisconnect: () => void,
  ) {
    worker.on('message', ({ id, message }: IpcServerToClientMessage) => {
      if (typeof id === 'number') {
        const resolvers = this.resolversMap.get(id);
        if (resolvers) {
          this.resolversMap.delete(id);
          resolvers.resolve(message);
        }
      } else {
        log(message.message);
      }
    });

    worker.on('exit', () => {
      this.reset();
      this.onDisconnect();
    });
  }

  public send<T extends IpcRequest>(message: T) {
    const messageId = this.nextMessageId++;

    const envelope = {
      id: messageId,
      message,
    } satisfies Envelope<T>;

    this.worker.postMessage(envelope);

    const { promise, ...resolvers } =
      withResolvers<ResponseTypeFromName<T['type']>>();
    this.resolversMap.set(messageId, resolvers as Resolvers);
    return promise;
  }

  public terminate() {
    this.worker.terminate().catch((e) => {
      log(`Failed to terminate worker: ${String(e)}`);
    });
    this.reset();
  }

  private reset() {
    for (const [, promise] of this.resolversMap) {
      promise.reject(new Error('Worker terminated'));
    }
    this.resolversMap.clear();
  }
}
