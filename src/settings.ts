import { QualifiedConfig } from '@commitlint/types';
import { workspace } from 'vscode';

export function getConfigFile() {
  return (
    workspace.getConfiguration('commitlint.config').get<string>('file') ||
    undefined
  );
}

export function getExtendConfiguration<T extends keyof QualifiedConfig>(
  config: T,
) {
  return (
    workspace
      .getConfiguration('commitlint.config.extend')
      .get<QualifiedConfig[T]>(config) || undefined
  );
}
