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

        if (typeof message.extendsRules === 'object' && message.extendsRules !== null) {
          /** @template T The type of the rule value. If valid, it will be `QualifiedRules | undefined` */
          type AnyInvalidRuleValue<T> = T extends typeof message.extendsRules[string]
            ? never
            : T;
          const invalidRules: Record<string, AnyInvalidRuleValue<unknown>> = {};
          const isInvalidRule = (entry: [string, unknown]): entry is [string, AnyInvalidRuleValue<unknown>] => {
            if (!Array.isArray(entry[1])) {
              return true;
            }

            const isInvalid = true,
              isValid = false,
              maybeRuleValue: readonly unknown[] = Object.freeze(entry[1]);

            /* disabled*/
            if (maybeRuleValue.length === 1 && maybeRuleValue[0] === 0) {
              return isValid;
            }

            /* warning or error w/ optional value */
            if (maybeRuleValue.length === 2 || maybeRuleValue.length === 3
              && (maybeRuleValue[0] === 1 || maybeRuleValue[0] === 2)
              && (maybeRuleValue[1] === 'always' || maybeRuleValue[1] === 'never')
            ) {
              // Type cast because typescript still thinks it's unknown[] despite narrowing.
              // Reminder: this line will be reduced to `(maybeRuleValue);` after build.
              (maybeRuleValue as [(1 | 2), ('always' | 'never')] | [(1 | 2), ('always' | 'never'), unknown]) satisfies typeof message.extendsRules[string];
              return isValid;
            }

            invalidRules[entry[0]] = maybeRuleValue;
            return isInvalid;
          }

          // remove some invalid rules from client's rules (non-thorough). The
          // rules of a bad config (e.g. in settings.json) may contain non-rule
          // values. This should be _loudly_ reported to the user. Although
          // commitlint would report it, it won't denote the config the invalid
          // rules came from. We must do it, instead.
          message.extendsRules = Object.fromEntries(
            Object.entries(message.extendsRules)
              .filter((entry) => !isInvalidRule(entry))
          ) satisfies typeof message.extendsRules;

          if (Object.keys(invalidRules).length > 0) {
            // TODO: change to warn(...) after implementing multi-LogLevel logging in IPC API. See https://www.npmjs.com/package/@vscode-logging/logger
            log(`One or more rules configured in user- or workspace-scoped settings.json#commitlint.config.extend.rules are invalid!\n${JSON.stringify(invalidRules, undefined, 2)}`);
          }
        }

        return {
          ...config,
          rules: { ...message.extendsRules, ...config.rules },
        };
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

    const problems = await lint(message.text, config.rules, {
      defaultIgnores: config.defaultIgnores,
      helpUrl: config.helpUrl,
      ignores: config.ignores,
      parserOpts: config.parserPreset?.parserOpts as LintOptions['parserOpts'],
      plugins: config.plugins,
    });

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
