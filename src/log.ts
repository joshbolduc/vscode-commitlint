import { type OutputChannel, window } from 'vscode';
import { getLogEnabled } from './settings';

let outputChannel: OutputChannel;

export function initLogger() {
  outputChannel = window.createOutputChannel('commitlint');
}

export function log(msg: string) {
  if (getLogEnabled()) {
    outputChannel.appendLine(msg);
  }
}
