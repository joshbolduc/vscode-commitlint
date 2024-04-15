import { getContext } from '../getContext';
import type { ParseIpcRequest, ParseIpcResponse } from '../ipcTypes';
import { log } from '../log';
import { ensureWorkerManager } from './workerManager';

export type Commit = ParseIpcResponse['commit'];

export const parse = async (
  text: string,
  path: string | undefined,
  parseOptions: {
    commentChar: string | undefined;
    verbose: boolean;
  },
) => {
  try {
    return await ensureWorkerManager().send<ParseIpcRequest>({
      type: 'parse',
      ...parseOptions,
      ...getContext(path),
      text,
    });
  } catch (e) {
    log(`Failed to parse message: ${String(e)}`);
  }
};
