import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, it } from 'vitest';
import { testLibRootPath } from '../../test/util';
import { loadLibrary, tryLoadDynamicLibrary } from './loadLibrary';

describe('loadLibrary', () => {
  const noOp = () => {
    // no-op
  };

  it('loads library installed locally', async () => {
    const { result, ...rest } = loadLibrary(
      '@commitlint/load',
      {
        preferBundledLibraries: false,
        globalNodePath: undefined,
        globalLibraryPath: undefined,
        path: resolve(testLibRootPath, 'v11'),
      },
      noOp,
    );

    expect(rest).toEqual({
      fallback: false,
      path: pathToFileURL(
        resolve(
          testLibRootPath,
          'v11',
          'node_modules',
          '@commitlint',
          'load',
          'lib',
          'load.js',
        ),
      ).href,
    });

    expect(await result).toMatchObject(expect.any(Function));
  });

  it('loads fallback when local path not specified and global library path not available', async () => {
    const { result, ...rest } = loadLibrary(
      '@commitlint/load',
      {
        preferBundledLibraries: false,
        globalNodePath: undefined,
        globalLibraryPath: undefined,
        path: undefined,
      },
      noOp,
    );

    expect(rest).toEqual({
      fallback: true,
    });

    expect(await result).toMatchObject(expect.any(Function));
  });

  it('loads fallback when local installation not available', () => {
    const result = tryLoadDynamicLibrary(
      '@npm/not-a-real-library',
      testLibRootPath,
      noOp,
    );

    expect(result).toBeUndefined();
  });
});
