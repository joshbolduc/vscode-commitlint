import {
  DiagnosticCollection,
  ExtensionContext,
  languages,
  TextDocument,
  window,
  workspace,
} from 'vscode';

import { refreshDiagnostics } from './diagnostics';
import { initLogger } from './log';
import { initStatusBar, updateStatusBar } from './statusBar';
import { isGitCommitDoc } from './utils';

function refresh(
  document: TextDocument,
  commitLintDiagnostics: DiagnosticCollection,
) {
  void refreshDiagnostics(document, commitLintDiagnostics);
}

export function activate(context: ExtensionContext) {
  initLogger();
  initStatusBar();

  const commitLintDiagnostics = languages.createDiagnosticCollection(
    'commitlint',
  );
  context.subscriptions.push(commitLintDiagnostics);

  if (window.activeTextEditor) {
    refresh(window.activeTextEditor.document, commitLintDiagnostics);
  }

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refresh(editor.document, commitLintDiagnostics);

        if (!isGitCommitDoc(editor.document)) {
          updateStatusBar();
        }
      }
    }),
  );

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((editor) => {
      refresh(editor.document, commitLintDiagnostics);
    }),
  );

  context.subscriptions.push(
    workspace.onDidCloseTextDocument((document) =>
      commitLintDiagnostics.delete(document.uri),
    ),
  );
}
