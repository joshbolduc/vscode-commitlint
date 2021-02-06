import load from '@commitlint/load';
import { workspace } from 'vscode';

export function loadConfig(filePath: string) {
  const searchPath = filePath ?? workspace.workspaceFolders?.[0].uri.fsPath;

  return load({}, { cwd: searchPath });
}
