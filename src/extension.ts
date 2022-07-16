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
  workspace.textDocuments.forEach((doc) => {
    refresh(doc, commitLintDiagnostics);
  });

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refresh(editor.document, commitLintDiagnostics);
      }
    }),
    workspace.onDidOpenTextDocument((doc) => {
      refresh(doc, commitLintDiagnostics);
    }),
    workspace.onDidChangeTextDocument((event) => {
      refresh(event.document, commitLintDiagnostics);
    }),
    workspace.onDidCloseTextDocument((document) =>
      commitLintDiagnostics.delete(document.uri),
    ),
  );
}

export function deactivate() {
  disposeStatusBar();
}
