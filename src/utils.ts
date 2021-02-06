import { TextDocument, window } from 'vscode';

export function isGitCommitDoc(doc: TextDocument) {
  return doc.languageId === 'git-commit';
}

export function enableCommitLint() {
  return (
    window.activeTextEditor && isGitCommitDoc(window.activeTextEditor.document)
  );
}
