import { languages, LanguageStatusItem, LanguageStatusSeverity } from 'vscode';
import { GIT_COMMIT_LANGUAGE_ID } from './utils';

const STATUS_ITEM_ID = 'commitlint-config-status';

let languageStatusItem: LanguageStatusItem;

export const enum StatusCode {
  Unknown,
  Ok,
  ConfigLoadFailed,
  NoRulesLoaded,
}

function setStatusBarProperties(
  severity: LanguageStatusSeverity,
  detail: string,
) {
  languageStatusItem.text = detail;
  languageStatusItem.detail = 'commitlint';
  languageStatusItem.severity = severity;
}

export function initStatusBar() {
  languageStatusItem = languages.createLanguageStatusItem(STATUS_ITEM_ID, {
    language: GIT_COMMIT_LANGUAGE_ID,
  });

  languageStatusItem.name = 'commitlint';
  languageStatusItem.text = 'commitlint';
}

export function disposeStatusBar() {
  languageStatusItem.dispose();
}

function updateStatusBarWithInfo(ruleCount: number, status: StatusCode) {
  switch (status) {
    case StatusCode.ConfigLoadFailed:
      setStatusBarProperties(
        LanguageStatusSeverity.Error,
        'Error loading config',
      );
      break;
    case StatusCode.NoRulesLoaded:
      setStatusBarProperties(LanguageStatusSeverity.Warning, 'No rules loaded');
      break;
    case StatusCode.Ok:
      setStatusBarProperties(
        LanguageStatusSeverity.Information,
        `${ruleCount} ${ruleCount === 1 ? 'rule' : 'rules'} loaded`,
      );
      break;
  }
}

function determineStatus(ruleCount?: number, givenStatus = StatusCode.Unknown) {
  if (givenStatus !== StatusCode.Ok && givenStatus !== StatusCode.Unknown) {
    return givenStatus;
  }

  if (ruleCount === 0) {
    return StatusCode.NoRulesLoaded;
  }

  return StatusCode.Ok;
}

export function updateStatusBar(ruleCount?: number, status?: StatusCode) {
  const actualStatus = determineStatus(ruleCount, status);
  updateStatusBarWithInfo(ruleCount ?? 0, actualStatus);
}
