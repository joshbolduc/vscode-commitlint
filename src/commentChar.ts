import type { TextDocument, Uri } from 'vscode';
import { getGitConfigForUri } from './gitConfig';
import { isScmTextInput } from './utils';

export const DEFAULT_COMMENT_CHAR = '#';

export async function getCommentChar(doc: TextDocument, uri: Uri | undefined) {
  // The SCM input does not respect comment chars
  if (isScmTextInput(doc)) {
    return undefined;
  }

  if (uri) {
    try {
      const result = await getGitConfigForUri(uri, 'core.commentchar');
      if (result) {
        return result;
      }
    } catch {
      // git extension likely not (yet) loaded
    }
  }

  return DEFAULT_COMMENT_CHAR;
}
