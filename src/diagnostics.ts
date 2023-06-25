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
import type { InputBox } from './git';
import { runLint } from './lint';
import { log } from './log';
import { parseCommit } from './parse';
import { stringify } from './stringify';
import { tryGetGitExtensionApi } from './tryGetGitExtensionApi';
import { isGitCommitDoc, isScmTextInput } from './utils';

interface InputBoxPrivate extends InputBox {
  _inputBox: {
    _sourceControlHandle: number;
  };
}

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
  if (!isGitCommitDoc(doc) && !isScmTextInput(doc)) {
    return [];
  }

  try {
    return await getDiagnostics(doc);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    log(`Uncaught exception: ${stringify(e)}`);
    return [];
  }
}

function getUriForDoc(doc: TextDocument) {
  if (!doc.isUntitled && doc.uri.scheme === 'file') {
    return doc.uri;
  }

  if (isScmTextInput(doc)) {
    const git = tryGetGitExtensionApi();

    if (git) {
      const matches = /scm\/git\/scm([0-9]+)\//.exec(doc.uri.path);
      if (matches?.[1]) {
        const handle = parseInt(matches[1]);

        const repo = git.repositories.find((repo) => {
          try {
            // This is undocumented, but there doesn't seem to be a better way to
            // figure out which repository the doc corresponds to
            return (
              (repo.inputBox as InputBoxPrivate)._inputBox
                ._sourceControlHandle === handle
            );
          } catch {
            // Undocumented API might have changed
            return false;
          }
        });

        if (repo) {
          return repo.rootUri;
        }
      }
    }
  }

  // Fall back to (first) workspace root
  return workspace.workspaceFolders?.[0]?.uri;
}

async function getDiagnostics(doc: TextDocument) {
  const text = doc.getText();

  const uri = getUriForDoc(doc);
  const path = uri?.fsPath;

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
