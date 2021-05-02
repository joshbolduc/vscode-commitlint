import { ExtensionContext, languages, window, workspace } from 'vscode';

import { refreshDiagnostics } from './diagnostics';
import { initLogger } from './log';
import { initStatusBar } from './statusBar';

export function activate(context: ExtensionContext) {
  initLogger();
  initStatusBar();

  const commitLintDiagnostics = languages.createDiagnosticCollection(
    'commitlint',
  );
  context.subscriptions.push(commitLintDiagnostics);

  if (window.activeTextEditor) {
    void refreshDiagnostics(
      window.activeTextEditor.document,
      commitLintDiagnostics,
    );
  }

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        void refreshDiagnostics(editor.document, commitLintDiagnostics);
      }
    }),
  );

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((editor) => {
      void refreshDiagnostics(editor.document, commitLintDiagnostics);
    }),
  );

  context.subscriptions.push(
    workspace.onDidCloseTextDocument((document) =>
      commitLintDiagnostics.delete(document.uri),
    ),
  );
}
