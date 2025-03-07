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
    parentPort?.postMessage(response);
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
    const mergedRules = {
      ...(message.extendsRules ?? {}),
      ...config.rules,
    };
    const problems = await lint(message.text, config.rules, rawOpts).then(
      async () => await lint(message.text, mergedRules, rawOpts),
    );

    return {
      ...problems,
      helpUrl: 'https://github.com/conventional-changelog/commitlint',
      loadedConfig: true,
      ruleCount: Object.keys(config.rules).length,
    };
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
