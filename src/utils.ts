import type { TextDocument } from 'vscode';

export const GIT_COMMIT_LANGUAGE_ID = 'git-commit';

export function isGitCommitDoc(doc: TextDocument) {
  return doc.languageId === GIT_COMMIT_LANGUAGE_ID;
}
