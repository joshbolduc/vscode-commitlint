import * as assert from 'assert';
import * as vscode from 'vscode';
import {
  makeClDiagnostic,
  simplifyDiagnostic,
  watchForDiagnostics,
} from './utils';

suite('vscode-commitlint', () => {
  test('reports diagnostics for commit message in editor', async () => {
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');

    const document = await vscode.workspace.openTextDocument({
      language: 'git-commit',
      content: 'Sample content',
    });

    await vscode.window.showTextDocument(document);

    const resolvedDiagnostics = await watchForDiagnostics(document.uri);

    assert.strictEqual(
      vscode.window.activeTextEditor!.document
        .getText()
        .includes('Sample content'),
      true,
    );

    assert.deepStrictEqual(resolvedDiagnostics.map(simplifyDiagnostic), [
      makeClDiagnostic({
        severity: vscode.DiagnosticSeverity.Error,
        message: 'subject may not be empty',
        range: [
          [0, 0],
          [0, 14],
        ],
        code: 'subject-empty',
      }),
      makeClDiagnostic({
        severity: vscode.DiagnosticSeverity.Error,
        message: 'type may not be empty',
        range: [
          [0, 0],
          [0, 14],
        ],
        code: 'type-empty',
      }),
    ]);
  });
});
