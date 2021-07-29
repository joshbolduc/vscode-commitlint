import { basename, dirname, isAbsolute } from 'path';
import { LoadOptions } from '@commitlint/types';
import { workspace } from 'vscode';
import { importCommitlintLoad } from './loadLibrary';
import { log } from './log';
import { getConfigFile, getExtendConfiguration } from './settings';

const getLoadOptions = (
  configFileSetting: string | undefined,
  workspacePath: string | undefined,
  filePath: string | undefined,
) => {
  if (configFileSetting) {
    if (isAbsolute(configFileSetting)) {
      return {
        cwd: dirname(configFileSetting),
        file: basename(configFileSetting),
      };
    }
    return { cwd: workspacePath, file: configFileSetting };
  }

  return { cwd: filePath };
};

export async function loadConfig(path: string | undefined) {
  const configOverwriteFile = getConfigFile();
  const extendsRules = getExtendConfiguration('rules');
  const workspacePath = workspace.workspaceFolders?.[0].uri.fsPath;

  const loadOptions: LoadOptions = getLoadOptions(
    configOverwriteFile,
    workspacePath,
    path,
  );

  const load = importCommitlintLoad(loadOptions.cwd);

  const config = await load({}, loadOptions);
  log(
    `[${new Date().toLocaleString()}] loadOptions: ${JSON.stringify(
      loadOptions,
    )}`,
  );

  return { ...config, rules: { ...extendsRules, ...config.rules } };
}
