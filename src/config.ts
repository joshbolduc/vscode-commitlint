import { dirname, isAbsolute, relative } from 'path';
import load from '@commitlint/load';
import { LoadOptions } from '@commitlint/types';
import { workspace } from 'vscode';
import { log } from './log';
import { getConfigFile, getExtendConfiguration } from './settings';

export async function loadConfig(path: string | undefined) {
  const configOverwriteFile = getConfigFile() || '';
  const extendsRules = getExtendConfiguration('rules');
  const workspacePath = workspace.workspaceFolders?.[0].uri.fsPath;
  const configOptions = isAbsolute(configOverwriteFile)
    ? {
        cwd: dirname(configOverwriteFile),
        file: relative(dirname(configOverwriteFile), configOverwriteFile),
      }
    : {
        cwd: workspacePath,
        file: configOverwriteFile,
      };

  const loadOptions: LoadOptions = configOverwriteFile
    ? configOptions
    : { cwd: path };

  const config = await load({}, loadOptions);
  log(
    `[${new Date().toLocaleString()}] loadOptions: ${JSON.stringify(
      loadOptions,
    )}`,
  );

  return { ...config, rules: { ...extendsRules, ...config.rules } };
}
