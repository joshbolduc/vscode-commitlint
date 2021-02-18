import load from '@commitlint/load';
import { LoadOptions } from '@commitlint/types';
import { workspace } from 'vscode';
import { getConfigFile } from './settings';

export function loadConfig(path: string | undefined) {
  const configFile = getConfigFile();

  const loadOptions: LoadOptions = configFile
    ? {
        cwd: workspace.workspaceFolders?.[0].uri.fsPath,
        file: configFile,
      }
    : { cwd: path };

  return load({}, loadOptions);
}
