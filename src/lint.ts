import lint from '@commitlint/lint';
import { ParserOptions } from '@commitlint/types';
import { loadConfig } from './config';
import { getLogger } from './log';
import { StatusCode, updateStatusBar } from './statusBar';

async function tryLoadConfig(path: string | undefined) {
  try {
    return await loadConfig(path);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (e.code === 'ENOENT') {
      getLogger().appendLine(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-template-expressions
        `Couldn't load commitlint config at ${e.path} (${e.code})`,
      );
    } else {
      getLogger().appendLine(`Load config error stack:\n${e as string}`);
    }
    return undefined;
  }
}

export async function runLint(text: string, path: string | undefined) {
  const config = await tryLoadConfig(path);

  if (!config) {
    updateStatusBar(0, StatusCode.ConfigLoadFailed);
    return undefined;
  }

  const ruleCount = Object.keys(config.rules).length;
  getLogger().appendLine(
    `[${new Date().toLocaleString()}] ${ruleCount} commitlint ${
      ruleCount === 1 ? 'rule' : 'rules'
    }:\n${JSON.stringify(config.rules)}`,
  );
  updateStatusBar(ruleCount);

  return lint(
    text,
    config.rules,
    config.parserPreset
      ? { parserOpts: config.parserPreset.parserOpts as ParserOptions }
      : {},
  );
}
