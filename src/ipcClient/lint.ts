import { workspace } from 'vscode';
import { getLoadOptions } from '../config';
import { getContext } from '../getContext';
import type { LintIpcRequest } from '../ipcTypes';
import { log } from '../log';
import { getConfigFile, getExtendConfiguration } from '../settings';
import { ensureWorkerManager } from './workerManager';

const makeCloneable = <T>(obj: T) => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

export const lint = async (text: string, path: string | undefined) => {
  const configOverwriteFile = getConfigFile();
  const workspacePath = workspace.workspaceFolders?.[0]?.uri.fsPath;
  const loadOptions = getLoadOptions(configOverwriteFile, workspacePath, path);
  const extendsRules = makeCloneable(getExtendConfiguration('rules'));

  try {
    return await ensureWorkerManager().send<LintIpcRequest>({
      type: 'lint',
      loadOptions,
      extendsRules,
      ...getContext(path),
      text,
    });
  } catch (e) {
    log(`Failed to lint message: ${String(e)}`);
  }
};
