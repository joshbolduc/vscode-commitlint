import type { TextDocument, Uri } from 'vscode';
import { getGitConfigForUri } from './gitConfig';
import { isScmTextInput } from './utils';

export const DEFAULT_COMMENT_CHAR = '#';

export async function getCommentChar(doc: TextDocument, uri: Uri | undefined) {
  // The SCM input does not respect comment chars
  if (isScmTextInput(doc)) {
    return undefined;
  }

  return (
    (uri ? getGitConfigForUri(uri, 'core.commentchar') : undefined) ??
    DEFAULT_COMMENT_CHAR
  );
}
