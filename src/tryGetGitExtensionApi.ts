import { extensions } from 'vscode';
import type { GitExtension } from './git';

export function tryGetGitExtensionApi() {
  const gitExtension =
    extensions.getExtension<GitExtension>('vscode.git')?.exports;
  try {
    return gitExtension?.getAPI(1);
  } catch {
    // extension not enabled?
  }
  return undefined;
}
