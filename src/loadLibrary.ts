import { resolve } from 'path';
import { getPrefixForLibraryLoad } from './getPrefixForLibraryLoad';
import { getSystemGlobalLibraryPath } from './getSystemGlobalLibraryPath';
import { isNodeExceptionCode } from './isNodeExceptionCode';
import { log } from './log';
import { getGlobalLibraryPath, getPreferBundledLibraries } from './settings';

interface BaseLoadResult<T> {
  result: T;
}

interface LocalLibraryLoadResult<T> extends BaseLoadResult<T> {
  path: string;
  fallback: false;
}

interface BundledLibraryLoadResult<T> extends BaseLoadResult<T> {
  fallback: true;
}

type LoadResult<T> = LocalLibraryLoadResult<T> | BundledLibraryLoadResult<T>;

export const tryLoadDynamicLibrary = <T>(
  name: string,
  path: string | undefined,
): LocalLibraryLoadResult<T> | undefined => {
  if (path) {
    try {
      const resolvePath = require.resolve(name, {
        paths: [path, resolve(path, '@commitlint', 'cli')],
      });

      log(`loading ${name} dynamically via ${resolvePath}`);
      return {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        result: require(resolvePath) as T,
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return { result: require(name) as T, fallback: true };
};

export const importCommitlintLoad = (path: string | undefined) => {
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
    process.env.PREFIX = oldEnvPrefix;
  }

  return result.default;
};

export const importCommitlintParse = (path: string | undefined) => {
  const { result } = loadLibrary<typeof import('@commitlint/parse')>(
    '@commitlint/parse',
    path,
  );

  return result.default;
};

export const importCommitlintLint = (path: string | undefined) => {
  const { result } = loadLibrary<typeof import('@commitlint/lint')>(
    '@commitlint/lint',
    path,
  );

  return result.default;
};
