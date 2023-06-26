import type { TextDocument, Uri } from 'vscode';
import { getGitConfigForUri, isGitConfigBooleanTrue } from './gitConfig';
import { splitCommit } from './splitCommit';
import { isScmTextInput } from './utils';

async function getVerboseSetting(uri: Uri) {
  const rawSetting = await getGitConfigForUri(uri, 'commit.verbose');
  return rawSetting === undefined
    ? rawSetting
    : isGitConfigBooleanTrue(rawSetting);
}

const verboseMap = new WeakMap<TextDocument, boolean>();

const DEFAULT_VERBOSE = true;

export function getScissorsLine(commentChar: string) {
  return `${commentChar} ------------------------ >8 ------------------------`;
}

export async function getVerbose(
  doc: TextDocument,
  uri: Uri | undefined,
  text: string,
  commentChar: string,
) {
  // Committing via the SCM input uses whatever the git config is set to
  if (isScmTextInput(doc)) {
    return (uri ? await getVerboseSetting(uri) : undefined) ?? DEFAULT_VERBOSE;
  }

  // Commits initiated outside of the editor may have been invoked using
  // `--verbose` (or `--no-verbose`), so the git config is not determinative. As
  // a heuristic, track whether the document was initially observed to have a
  // scissors line or not. If it did, assume it is for a commit that was
  // initiated in verbose mode.
  if (!verboseMap.has(doc)) {
    verboseMap.set(
      doc,
      splitCommit(text).includes(getScissorsLine(commentChar)),
    );
  }

  return verboseMap.get(doc) ?? DEFAULT_VERBOSE;
}
