import type { LintRuleOutcome } from '@commitlint/types';
import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  Range,
  TextDocument,
  Uri,
  workspace,
} from 'vscode';
import { runLint } from './lint';
import { parseCommit } from './parse';
import { isGitCommitDoc } from './utils';

const rulePrefixMapping = {
  header: ['header', 'scope', 'subject', 'type'],
  body: ['body'],
  footer: ['footer'],
};

function mapRuleToSection(rule: string) {
  const [key] =
    Object.entries(rulePrefixMapping).find(([, prefixes]) => {
      return prefixes.some((prefix) => rule.startsWith(`${prefix}-`));
    }) ?? [];

  return key;
}

function createDiagnostic(
  doc: TextDocument,
  result: LintRuleOutcome,
  range: readonly [number, number],
  helpUrl: string,
) {
  const [startIndex, endIndex] = range;

  const diagnostic = new Diagnostic(
    new Range(doc.positionAt(startIndex), doc.positionAt(endIndex)),
    result.message,
    result.level === 2 ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
  );

  let target: Uri | undefined;
  try {
    target = Uri.parse(helpUrl, true);
  } catch {
    // malformed user-provided data
  }

  diagnostic.code = target ? { value: result.name, target } : result.name;
  diagnostic.source = 'commitlint';

  return diagnostic;
}

async function tryGetDiagnostics(doc: TextDocument) {
  if (!isGitCommitDoc(doc)) {
    return [];
  }

  try {
    return await getDiagnostics(doc);
  } catch {
    return [];
  }
}

async function getDiagnostics(doc: TextDocument) {
  const text = doc.getText();

  const useWorkspaceConfig = doc.isUntitled || doc.uri.scheme !== 'file';

  const path = useWorkspaceConfig
    ? workspace.workspaceFolders?.[0]?.uri.fsPath
    : doc.uri.fsPath;

  const { ranges, sanitizedText } = await parseCommit(text, path);

  const lintResult = await runLint(sanitizedText, path);

  if (!lintResult) {
    return;
  }

  const {
    problems: { errors = [], warnings = [] },
    helpUrl,
  } = lintResult;

  return [...errors, ...warnings].map((issue) => {
    const section = mapRuleToSection(issue.name);

    const prefix = issue.name.substr(0, issue.name.indexOf('-'));

    const range = ranges[prefix as keyof typeof ranges] ??
      ranges[section as keyof typeof ranges] ?? [0, text.length];

    return createDiagnostic(doc, issue, range, helpUrl);
  });
}

export async function refreshDiagnostics(
  doc: TextDocument,
  commitLintDiagnostics: DiagnosticCollection,
) {
  const diagnostics = await tryGetDiagnostics(doc);
  commitLintDiagnostics.set(doc.uri, diagnostics);
}
