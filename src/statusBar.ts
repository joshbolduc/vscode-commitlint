import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { enableCommitLint } from './utils';

const PRIORITY = 0;

let statusBarItem: StatusBarItem;

export function initStatusBar() {
  statusBarItem = window.createStatusBarItem(
    StatusBarAlignment.Right,
    PRIORITY,
  );

  statusBarItem.text = 'commitlint';
  statusBarItem.tooltip = undefined;
  statusBarItem.accessibilityInformation = {
    label: 'Commit lint is running.',
  };
}

export function updateStatusBar(ruleCount?: number) {
  if (enableCommitLint()) {
    if (ruleCount === 0) {
      statusBarItem.text = '$(alert) commitlint';
      statusBarItem.tooltip =
        'No rules loaded. Commitlint may not have been configured for this repository.';
      statusBarItem.accessibilityInformation = {
        label:
          'Commit lint is running. No rules loaded. Commit lint may not have been configured for this repository.',
      };
    } else if (typeof ruleCount === 'number') {
      statusBarItem.text = '$(check) commitlint';
      statusBarItem.tooltip = `${ruleCount} ${
        ruleCount === 1 ? 'rule' : 'rules'
      } loaded`;
      statusBarItem.accessibilityInformation = {
        label: `Commit lint is running. ${ruleCount} rules loaded.`,
      };
    }

    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}
