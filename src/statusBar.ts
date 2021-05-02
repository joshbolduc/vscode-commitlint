import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

const PRIORITY = 0;

const TEXT_ERROR = '$(error) commitlint';
const TEXT_WARNING = '$(alert) commitlint';
const TEXT_OK = '$(check) commitlint';

let statusBarItem: StatusBarItem;

export const enum StatusCode {
  Unknown,
  Ok,
  ConfigLoadFailed,
  NoRulesLoaded,
}

function setStatusBarProperties(
  text: string,
  tooltip: string | undefined,
  accessibilityLabel: string,
) {
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
  statusBarItem.accessibilityInformation = {
    label: accessibilityLabel,
  };
}

export function initStatusBar() {
  statusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right,
    PRIORITY,
  );

  setStatusBarProperties('commitlint', undefined, 'Commit lint is running.');
}

function updateStatusBarWithInfo(ruleCount: number, status: StatusCode) {
  switch (status) {
    case StatusCode.ConfigLoadFailed:
      setStatusBarProperties(
        TEXT_ERROR,
        'Failed loading commitlint configuration. Check your configuration path.',
        'Failed loading commit lint configuration. Check your configuration path.',
      );
      break;
    case StatusCode.NoRulesLoaded:
      setStatusBarProperties(
        TEXT_WARNING,
        'No rules loaded. Commitlint may not have been configured for this repository.',
        'Commit lint is running. No rules loaded. Commit lint may not have been configured for this repository.',
      );
      break;
    case StatusCode.Ok:
      setStatusBarProperties(
        TEXT_OK,
        `${ruleCount} ${ruleCount === 1 ? 'rule' : 'rules'} loaded`,
        `Commit lint is running. ${ruleCount} rules loaded.`,
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
  if (!hideStatusBar()) {
    const actualStatus = determineStatus(ruleCount, status);
    updateStatusBarWithInfo(ruleCount ?? 0, actualStatus);
    statusBarItem.show();
  }
}

export function hideStatusBar(): boolean {
  if (window.activeTextEditor?.document?.languageId !== 'git-commit') {
    statusBarItem.hide();
    return true;
  } else return false;
}
