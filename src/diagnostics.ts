import { LintRuleOutcome } from '@commitlint/types';
import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  Range,
  TextDocument,
  workspace,
} from 'vscode';
import { runLint } from './lint';
import {
  getAdjustedRanges,
  getCleanText,
  getCommitRanges,
  parseCommit,
} from './parse';
import { hideStatusBar, updateStatusBar } from './statusBar';

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
) {
  const [startIndex, endIndex] = range;

  const diagnostic = new Diagnostic(
    new Range(doc.positionAt(startIndex), doc.positionAt(endIndex)),
    result.message,
    result.level === 2 ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
  );
  diagnostic.code = result.name;
  diagnostic.source = 'commitlint';

  return diagnostic;
}

async function tryGetDiagnostics(doc: TextDocument) {
  if (hideStatusBar()) return [];
  try {
    return await getDiagnostics(doc);
  } catch {
    updateStatusBar();
    return [];
  }
}

async function getDiagnostics(doc: TextDocument) {
  const text = doc.getText();

  const sanitizedText = getCleanText(text);

  const useWorkspaceConfig = doc.isUntitled || doc.uri.scheme !== 'file';

  const [problems, commit] = await Promise.all([
    runLint(
      sanitizedText,
      useWorkspaceConfig
        ? workspace.workspaceFolders?.[0].uri.fsPath
        : doc.uri.fsPath,
    ),
    parseCommit(sanitizedText),
  ]);

  const prelimRanges = getCommitRanges(commit);
  const ranges = getAdjustedRanges(prelimRanges, text);

  const { errors = [], warnings = [] } = problems ?? {};

  return [...errors, ...warnings].map((issue) => {
    const section = mapRuleToSection(issue.name);

    const prefix = issue.name.substr(0, issue.name.indexOf('-'));

    const range = ranges[prefix as keyof typeof ranges] ??
      ranges[section as keyof typeof ranges] ?? [0, text.length];

    return createDiagnostic(doc, issue, range);
  });
}

export async function refreshDiagnostics(
  doc: TextDocument,
  commitLintDiagnostics: DiagnosticCollection,
) {
  const diagnostics = await tryGetDiagnostics(doc);
  commitLintDiagnostics.set(doc.uri, diagnostics);
}
