import { lint } from './ipcClient/lint';
import { StatusCode, updateStatusBar } from './statusBar';

export async function runLint(text: string, path: string | undefined) {
  const lintResult = await lint(text, path);

  if (!lintResult?.loadedConfig) {
    updateStatusBar(0, StatusCode.ConfigLoadFailed);
    return undefined;
  }

  const { ruleCount, errors, helpUrl, warnings } = lintResult;

  updateStatusBar(ruleCount);

  return {
    problems: {
      errors,
      warnings,
    },
    helpUrl,
  };
}
