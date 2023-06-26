import type { Uri } from 'vscode';
import type { Repository } from './git';
import { tryGetGitExtensionApi } from './tryGetGitExtensionApi';

async function tryReadGitConfig<T>(read: () => Promise<T>) {
  try {
    return await read();
  } catch (e) {
    if (typeof e === 'object' && e && 'exitCode' in e && e.exitCode === 1) {
      return undefined;
    }
    throw e;
  }
}

async function getGitConfigForRepo(repo: Repository, key: string) {
  const localResult = await tryReadGitConfig(() => repo.getConfig(key));
  if (localResult !== undefined) {
    return localResult;
  }

  return tryReadGitConfig(() => repo.getGlobalConfig(key));
}

function getGitRepoForUri(uri: Uri) {
  const git = tryGetGitExtensionApi();
  return uri ? git?.getRepository(uri) : undefined;
}

export async function getGitConfigForUri(uri: Uri, key: string) {
  const repo = getGitRepoForUri(uri);
  if (repo) {
    return await getGitConfigForRepo(repo, key);
  }
}

export function isGitConfigBooleanTrue(value: string) {
  // Boolean true literals are yes, on, true, and 1. Also, a variable defined
  // without = <value> is taken as true.
  // @see
  // https://www.git-scm.com/docs/git-config/2.41.0#Documentation/git-config.txt-true
  return ['yes', 'on', 'true', '1', ''].includes(value);
}
