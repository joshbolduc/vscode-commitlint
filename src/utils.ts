import type { TextDocument } from 'vscode';

export const GIT_COMMIT_LANGUAGE_ID = 'git-commit';
const SCMINPUT_LANGUAGE_ID = 'scminput';
const VSCODE_URI_SCHEME = 'vscode';
const VSCODESCM_URI_SCHEME = 'vscode-scm';

export function isGitCommitDoc(doc: TextDocument) {
  return doc.languageId === GIT_COMMIT_LANGUAGE_ID;
}

export function isScmTextInput(doc: TextDocument) {
  return (
    doc.languageId === SCMINPUT_LANGUAGE_ID &&
    (doc.uri.scheme === VSCODE_URI_SCHEME ||
      doc.uri.scheme === VSCODESCM_URI_SCHEME)
  );
}
