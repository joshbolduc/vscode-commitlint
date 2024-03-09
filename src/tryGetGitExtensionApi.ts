import { extensions } from 'vscode';
import type { GitExtension } from './git';
import { log } from './log';

export function tryGetGitExtensionApi() {
  try {
    const gitExtension =
      extensions.getExtension<GitExtension>('vscode.git')?.exports;
    return gitExtension?.getAPI(1);
  } catch {
    log('Unable to load git extension (not enabled or not yet loaded)');
  }
  return undefined;
}
