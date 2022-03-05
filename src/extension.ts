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
import { disposeStatusBar, initStatusBar } from './statusBar';

function refresh(
  document: TextDocument,
  commitLintDiagnostics: DiagnosticCollection,
) {
  void refreshDiagnostics(document, commitLintDiagnostics);
}

export function activate(context: ExtensionContext) {
  initLogger();
  initStatusBar();

  const commitLintDiagnostics =
    languages.createDiagnosticCollection('commitlint');
  context.subscriptions.push(commitLintDiagnostics);

  if (window.activeTextEditor) {
    refresh(window.activeTextEditor.document, commitLintDiagnostics);
  }

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refresh(editor.document, commitLintDiagnostics);
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

export function deactivate() {
  disposeStatusBar();
}
