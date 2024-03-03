import { resolve } from 'path';
import { getPrefixForLibraryLoad } from './getPrefixForLibraryLoad';
import { getSystemGlobalLibraryPath } from './getSystemGlobalLibraryPath';
import { isNodeExceptionCode } from './isNodeExceptionCode';
import { log } from './log';
import { getGlobalLibraryPath, getPreferBundledLibraries } from './settings';

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

      log(`loading ${name} dynamically via ${resolvePath}`);
      return {
        result: importDefaultExport<T>(resolvePath),
        path: resolvePath,
        fallback: false,
      };
    } catch (e) {
      if (!isNodeExceptionCode(e, 'MODULE_NOT_FOUND')) {
        throw e;
      }
    }
  }

  return undefined;
};

export const loadLibrary = <T>(
  name: string,
  path: string | undefined,
): LoadResult<T> => {
  const preferBundledLibraries = getPreferBundledLibraries();

  if (!preferBundledLibraries) {
    const localResult = tryLoadDynamicLibrary<T>(name, path);
    if (localResult) {
      return localResult;
    }

    const globalPath =
      getGlobalLibraryPath(path) || getSystemGlobalLibraryPath();
    if (globalPath) {
      const globalResult = tryLoadDynamicLibrary<T>(name, globalPath);
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

export const importCommitlintLoad = async (path: string | undefined) => {
  const oldEnvPrefix = process.env.PREFIX;
  const prefixPath = getPrefixForLibraryLoad(path);
  if (prefixPath) {
    process.env.PREFIX = prefixPath;
  }

  const { result } = loadLibrary<typeof import('@commitlint/load')>(
    '@commitlint/load',
    path,
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

export const importCommitlintParse = async (path: string | undefined) => {
  const { result } = loadLibrary<typeof import('@commitlint/parse')>(
    '@commitlint/parse',
    path,
  );

  return result;
};

export const importCommitlintLint = async (path: string | undefined) => {
  const { result } = loadLibrary<typeof import('@commitlint/lint')>(
    '@commitlint/lint',
    path,
  );

  return result;
};
