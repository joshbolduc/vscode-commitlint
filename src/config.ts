import { resolve } from 'path';
import load from '@commitlint/load';
import { LoadOptions, RuleConfigQuality, RulesConfig } from '@commitlint/types';
import { workspace } from 'vscode';
import { getConfigFile, getExtendConfiguration } from './settings';

export async function loadConfig(path: string | undefined) {
  const configOverwriteFile = getConfigFile();
  const extendsRules = getExtendConfiguration('rules') as Partial<
    RulesConfig<RuleConfigQuality.Qualified>
  >;
  const cwd = workspace.workspaceFolders?.[0].uri.fsPath;

  const loadOptions: LoadOptions = configOverwriteFile
    ? {
        cwd: cwd,
        file: resolve(cwd || '', configOverwriteFile),
      }
    : { cwd: path };

  const config = await load({}, loadOptions);

  for (const rule in extendsRules) {
    if (!config.rules?.[rule]) {
      config.rules[rule] = extendsRules[rule];
    }
  }

  return config;
}
