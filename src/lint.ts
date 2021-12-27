import { ParserOptions } from '@commitlint/types';
import { loadConfig } from './config';
import { importCommitlintLint } from './loadLibrary';
import { log } from './log';
import { StatusCode, updateStatusBar } from './statusBar';

async function tryLoadConfig(path: string | undefined) {
  try {
    return await loadConfig(path);
  } catch (e) {
    if (
      e &&
      typeof e === 'object' &&
      (e as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      const { path, code } = e as NodeJS.ErrnoException;
      log(
        `Couldn't load commitlint config at ${path ?? '(unknown path)'} (${
          code ?? 'unknown code'
        })`,
      );
    } else {
      log(`Load config error stack:\n${e as string}`);
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
  log(
    `[${new Date().toLocaleString()}] ${ruleCount} commitlint ${
      ruleCount === 1 ? 'rule' : 'rules'
    }:\n${JSON.stringify(config.rules)}`,
  );
  updateStatusBar(ruleCount);

  const lint = importCommitlintLint(path);

  return {
    problems: await lint(
      text,
      config.rules,
      config.parserPreset
        ? { parserOpts: config.parserPreset.parserOpts as ParserOptions }
        : {},
    ),
    helpUrl: config.helpUrl,
  };
}
