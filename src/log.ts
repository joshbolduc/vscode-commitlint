import { OutputChannel, window } from 'vscode';

let outputChannel: OutputChannel;

export function initLogger() {
  outputChannel = window.createOutputChannel('commitlint');
}

export function getLogger() {
  return outputChannel;
}
