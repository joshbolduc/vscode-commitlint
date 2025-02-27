import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { IpcRequestContext } from '../ipcTypes';
import { getPrefixForLibraryLoad } from './utils/getPrefixForLibraryLoad';
import { getSystemGlobalLibraryPath } from './utils/getSystemGlobalLibraryPath';
import { isNodeExceptionCode } from './utils/isNodeExceptionCode';

interface BaseLoadResult<T> {
  result: Promise<UnwrapDefault<T>>;
}

interface LocalLibraryLoadResult<T> extends BaseLoadResult<T> {
  path: string;
  fallback: false;
}

interface BundledLibraryLoadResult<T> extends BaseLoadResult<T> {
  fallback: true;
}

type LoadResult<T> = LocalLibraryLoadResult<T> | BundledLibraryLoadResult<T>;

type LogFn = (message: string) => void;

type UnwrapDefault<T> = T extends {
  default: infer U;
}
  ? U
  : T;

const unwrapDefaultExport = <T>(module: T): UnwrapDefault<T> => {
  if (typeof module === 'object' && module !== null && 'default' in module) {
    return unwrapDefaultExport(module.default) as UnwrapDefault<T>;
  }
  return module as UnwrapDefault<T>;
};

const importDefaultExport = async <T>(path: string) => {
  const result = (await import(path)) as T;
  return unwrapDefaultExport(result);
};

export const tryLoadDynamicLibrary = <T>(
  name: string,
  path: string | undefined,
  log: LogFn,
): LocalLibraryLoadResult<T> | undefined => {
  if (path) {
    try {
      const resolvePath = require.resolve(name, {
        paths: [
          path,
          resolve(path, '@commitlint', 'cli'),
          resolve(path, 'commitlint'),
        ],
      });

      // Ensure the path is importable, e.g., on Windows
      const pathHref = pathToFileURL(resolvePath).href;

      log(`loading ${name} dynamically via ${resolvePath}`);
      return {
        result: importDefaultExport<T>(pathHref),
        path: pathHref,
        fallback: false,
      };
    } catch (e) {
      if (
        !isNodeExceptionCode(e, 'MODULE_NOT_FOUND') &&
        !isNodeExceptionCode(e, 'ERR_REQUIRE_ESM')
      ) {
        throw e;
      }
    }
  }

  return undefined;
};

export const loadLibrary = <T>(
  name: string,
  { globalLibraryPath, path, preferBundledLibraries }: IpcRequestContext,
  log: LogFn,
): LoadResult<T> => {
  if (!preferBundledLibraries) {
    const localResult = tryLoadDynamicLibrary<T>(name, path, log);
    if (localResult) {
      return localResult;
    }

    const globalPath = globalLibraryPath || getSystemGlobalLibraryPath();
    if (globalPath) {
      const globalResult = tryLoadDynamicLibrary<T>(name, globalPath, log);
      if (globalResult) {
        return globalResult;
      }
    }
  }

  log(`loading bundled version of ${name} as fallback`);
  return {
    result: importDefaultExport<T>(name),
    fallback: true,
  };
};

export const importCommitlintLoad = async (
  context: IpcRequestContext,
  log: LogFn,
) => {
  const oldEnvPrefix = process.env.PREFIX;
  const prefixPath = getPrefixForLibraryLoad(
    context.path,
    context.globalNodePath,
  );
  if (prefixPath) {
    process.env.PREFIX = prefixPath;
  }

  const { result } = loadLibrary<typeof import('@commitlint/load')>(
    '@commitlint/load',
    context,
    log,
  );

  if (prefixPath) {
    if (typeof oldEnvPrefix === undefined) {
      delete process.env.PREFIX;
    } else {
      process.env.PREFIX = oldEnvPrefix;
    }
  }

  return result;
};

export const importCommitlintParse = async (
  context: IpcRequestContext,
  log: LogFn,
) => {
  const { result } = loadLibrary<typeof import('@commitlint/parse')>(
    '@commitlint/parse',
    context,
    log,
  );

  return result;
};

export const importCommitlintLint = async (
  context: IpcRequestContext,
  log: LogFn,
) => {
  const { result } = loadLibrary<typeof import('@commitlint/lint')>(
    '@commitlint/lint',
    context,
    log,
  );

  return result;
};
