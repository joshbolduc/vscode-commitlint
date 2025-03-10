import { parentPort } from 'worker_threads';
import type { LintOptions } from '@commitlint/types';
import type {
  IpcClientToServerMessage,
  IpcRequest,
  IpcRequestContext,
  IpcServerToClientMessage,
  LintIpcRequest,
  LintIpcResponse,
  ParseIpcRequest,
  ParseIpcResponse,
} from '../ipcTypes';
import {
  importCommitlintLint,
  importCommitlintLoad,
  importCommitlintParse,
} from './loadLibrary';
import { isNodeExceptionCode } from './utils/isNodeExceptionCode';

if (parentPort) {
  const postResult = (response: IpcServerToClientMessage) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    parentPort!.postMessage(response);
  };

  const log = (message: string) => {
    postResult({ message: { type: 'log', message } });
  };

  const getContext = (message: IpcRequest) => {
    return {
      globalLibraryPath: message.globalLibraryPath,
      globalNodePath: message.globalNodePath,
      preferBundledLibraries: message.preferBundledLibraries,
      path: message.path,
    } satisfies IpcRequestContext;
  };

  const parse = async (message: ParseIpcRequest): Promise<ParseIpcResponse> => {
    const context = getContext(message);
    const parse = await importCommitlintParse(context, log);
    const commit = await parse(message.text);
    return { commit };
  };

  const lint = async (message: LintIpcRequest): Promise<LintIpcResponse> => {
    const context = getContext(message);
    const load = await importCommitlintLoad(context, log);
    const lint = await importCommitlintLint(context, log);

    const loadConfig = async () => {
      try {
        const config = await load({}, message.loadOptions);
        const ruleCount = Object.keys(config.rules).length;
        log(
          `[${new Date().toLocaleString()}] ${ruleCount} commitlint ${
            ruleCount === 1 ? 'rule' : 'rules'
          }:\n${JSON.stringify(config.rules)}`,
        );

        return config;
      } catch (e) {
        if (isNodeExceptionCode(e, 'ENOENT')) {
          log(
            `Couldn't load commitlint config at ${
              e.path ?? '(unknown path)'
            } (${e.code})`,
          );
        } else {
          log(`Load config error stack:\n${e as string}`);
        }
        return undefined;
      }
    };

    const config = await loadConfig();
    if (!config) {
      return {
        loadedConfig: false,
      };
    }

    const rawOpts = {
      defaultIgnores: config.defaultIgnores,
      helpUrl: config.helpUrl,
      ignores: config.ignores,
      parserOpts: config.parserPreset?.parserOpts as LintOptions['parserOpts'],
      plugins: config.plugins,
    };
    const mergedRules =
      message.extendsRules === undefined
        ? config.rules
        : { ...message.extendsRules, ...config.rules };
    try {
      const problems = await lint(message.text, mergedRules, rawOpts);

      return {
        ...problems,
        helpUrl: 'https://github.com/conventional-changelog/commitlint',
        loadedConfig: true,
        ruleCount: Object.keys(mergedRules).length,
      };
    } catch (error) {
      // Failed to lint with merged rules; would we succeed with just the loaded config?
      try {
        await lint(message.text, config.rules, rawOpts);
        // Yes, it's probably something in settings.json -- log or return something accordingly

        // todo: notification e.g. "failed to load commitlint config; see logs for details". Maybe grab https://www.npmjs.com/package/@vscode-logging/logger
        log(
          new Error(
            "Failed to load Commitlint config. Cause: The config file loaded, but rules defined in vscode-commitlint's settings are invalid or you are missing their plugin.",
            { cause: error },
          ).toString(),
        );
        return { loadedConfig: false };
      } catch (e) {
        // No, it's something else -- log or return something accordingly

        // todo: notification e.g. "failed to load commitlint config; see logs for details". Maybe grab https://www.npmjs.com/package/@vscode-logging/logger
        log(
          new AggregateError(
            [error, e],
            'Commitlint config failed to load.',
          ).toString(),
        );

        return { loadedConfig: false };
      }
    }
  };

  const handleMessage = ({ message, id }: IpcClientToServerMessage) => {
    const getResult = async () => {
      switch (message.type) {
        case 'parse':
          return parse(message);
        case 'lint': {
          return lint(message);
        }
      }
    };

    const handleAsync = async () => {
      const result = await getResult();
      postResult({ id, message: result });
    };

    handleAsync().catch(console.error);
  };

  parentPort.on('message', handleMessage);

  parentPort.on('disconnect', () => {
    process.exit();
  });
}
