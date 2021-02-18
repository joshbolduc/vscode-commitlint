import { workspace } from 'vscode';

export function getConfigFile() {
  return (
    workspace.getConfiguration('commitlint.config').get<string>('file') ||
    undefined
  );
}
