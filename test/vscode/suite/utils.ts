import * as vscode from 'vscode';

type DiagnosticSimplified = Pick<
  vscode.Diagnostic,
  'severity' | 'message' | 'source'
> & {
  range: [
    { line: number; character: number },
    { line: number; character: number },
  ];
  code: {
    value: string;
    target: string;
  };
};

export const watchForDiagnostics = (
  uri: vscode.Uri,
): Promise<vscode.Diagnostic[]> => {
  return new Promise<vscode.Diagnostic[]>((resolve) => {
    const disposable = vscode.languages.onDidChangeDiagnostics(() => {
      const diagnostics = vscode.languages.getDiagnostics(uri);

      disposable.dispose();
      resolve(diagnostics);
    });
  });
};

export const simplifyDiagnostic = (
  diagnostic: vscode.Diagnostic,
): DiagnosticSimplified => {
  if (!diagnostic.code) {
    throw new Error('Diagnostic code is required');
  }

  if (typeof diagnostic.code !== 'object' || !('value' in diagnostic.code)) {
    throw new Error('Diagnostic code must have a value property');
  }

  if (typeof diagnostic.code.value !== 'string') {
    throw new Error('Diagnostic code value must be a string');
  }

  return {
    severity: diagnostic.severity,
    message: diagnostic.message,
    range: [
      {
        character: diagnostic.range.start.character,
        line: diagnostic.range.start.line,
      },
      {
        character: diagnostic.range.end.character,
        line: diagnostic.range.end.line,
      },
    ],
    source: diagnostic.source,
    code: {
      value: diagnostic.code.value,
      target: diagnostic.code.target.toString(),
    },
  };
};

export const makeClDiagnostic = ({
  severity,
  message,
  range: [[startLine, startChar], [endLine, endChar]],
  code,
}: {
  severity: vscode.DiagnosticSeverity;
  message: string;
  range: [[line: number, character: number], [line: number, character: number]];
  code: string;
}): DiagnosticSimplified => {
  return {
    severity,
    message,
    range: [
      { line: startLine, character: startChar },
      { line: endLine, character: endChar },
    ],
    source: 'commitlint',
    code: {
      value: code,
      target:
        'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
    },
  };
};
