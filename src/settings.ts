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

export function getLogEnabled() {
  return (
    workspace.getConfiguration('commitlint.log').get<boolean>('enabled') ||
    false
  );
}

export function getPreferBundledLibraries() {
  return (
    workspace
      .getConfiguration('commitlint')
      .get<boolean>('preferBundledLibraries') || false
  );
}
