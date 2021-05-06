import load from '@commitlint/load';
import { LoadOptions } from '@commitlint/types';
import { workspace } from 'vscode';
import { getConfigFile, getExtendConfiguration } from './settings';

export async function loadConfig(path: string | undefined) {
  const configFile = getConfigFile();
  const extendsRules = getExtendConfiguration('rules');

  const loadOptions: LoadOptions = configFile
    ? {
        cwd: workspace.workspaceFolders?.[0].uri.fsPath,
        file: configFile,
      }
    : { cwd: path };

  const config = await load({}, loadOptions);

  return { ...config, rules: { ...extendsRules, ...config.rules } };
}
