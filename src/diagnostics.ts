import type { LintRuleOutcome, RuleConfigSeverity } from '@commitlint/types';
import {
  Diagnostic,
  type DiagnosticCollection,
  DiagnosticSeverity,
  Range,
  type TextDocument,
  Uri,
  workspace,
} from 'vscode';
import { DEFAULT_COMMENT_CHAR, getCommentChar } from './commentChar';
import type { InputBox } from './git';
import { runLint } from './lint';
import { log } from './log';
import { parseCommit } from './parse';
import { stringify } from './stringify';
import { tryGetGitExtensionApi } from './tryGetGitExtensionApi';
import { isGitCommitDoc, isScmTextInput } from './utils';
import { getVerbose } from './verbose';

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
    result.level === (2 as RuleConfigSeverity.Error) ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
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
    // Sufficiently recent versions of VS Code include a rootUri query parameter
    const queryParams = new URLSearchParams(doc.uri.query);
    const rootUri = queryParams.get('rootUri');

    if (rootUri) {
      return Uri.parse(rootUri, true);
    }

    // Older versions require fragile, undocumented tricks that don't work in
    // later versions
    const git = tryGetGitExtensionApi();

    if (git) {
      const matches = /git\/scm([0-9]+)\//.exec(doc.uri.path);
      if (matches?.[1]) {
        const handle = parseInt(matches[1]);

        const repo = git.repositories.find((repo) => {
          try {
            return (
              (repo.inputBox as InputBoxPrivate)._inputBox
                ._sourceControlHandle === handle
            );
          } catch {
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

  const commentChar = await getCommentChar(doc, uri);
  const verbose = await getVerbose(
    doc,
    uri,
    text,
    commentChar ?? DEFAULT_COMMENT_CHAR,
  );

  const { ranges, sanitizedText } = await parseCommit(text, path, {
    commentChar,
    verbose,
  });

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
