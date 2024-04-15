import type {
  LintRuleOutcome,
  LoadOptions,
  QualifiedRules,
} from '@commitlint/types';

type ParsedCommit = Awaited<
  ReturnType<typeof import('@commitlint/parse').default>
>;

export type MessageId = number;

export interface IpcRequestContext {
  path: string | undefined;
  preferBundledLibraries: boolean;
  globalLibraryPath: string | undefined;
  globalNodePath: string | undefined;
}

export interface ParseIpcRequest extends IpcRequestContext {
  type: 'parse';
  text: string;
  commentChar: string | undefined;
  verbose: boolean;
}

export interface ParseIpcResponse {
  commit: ParsedCommit;
}

export interface LintIpcRequest extends IpcRequestContext {
  type: 'lint';
  text: string;
  loadOptions: LoadOptions;
  extendsRules: QualifiedRules | undefined;
}

export type LintIpcResponse =
  | {
      errors: LintRuleOutcome[];
      warnings: LintRuleOutcome[];
      helpUrl: string;
      ruleCount: number;
      loadedConfig: true;
    }
  | {
      loadedConfig: false;
    };

type ResponseTypeMap = {
  parse: ParseIpcResponse;
  lint: LintIpcResponse;
};

export type ResponseTypeFromName<T extends IpcRequest['type']> =
  ResponseTypeMap[T];

export interface Envelope<T> {
  id: MessageId;
  message: T;
}

export type IpcRequest = ParseIpcRequest | LintIpcRequest;
export type IpcResponse = ResponseTypeMap[IpcRequest['type']];

export interface LogIpcMessage {
  type: 'log';
  message: string;
}

export type IpcClientToServerMessage = Envelope<IpcRequest>;

export type IpcServerToClientMessage =
  | Envelope<IpcResponse>
  | { id?: never; message: LogIpcMessage };
