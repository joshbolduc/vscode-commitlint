import { workspace } from 'vscode';

export function getConfigFile() {
  return (
    workspace.getConfiguration('commitlint.config').get<string>('file') ||
    undefined
  );
}

export function getExtendConfiguration(config: string) {
  return (
    workspace.getConfiguration('commitlint.config.extend').get(config) ||
    undefined
  );
}
