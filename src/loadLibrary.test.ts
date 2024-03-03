import { resolve } from 'path';
import { describe, expect, it, vi } from 'vitest';
import { testLibRootPath } from '../test/util';
import { loadLibrary, tryLoadDynamicLibrary } from './loadLibrary';

vi.mock('./getSystemGlobalLibraryPath');
vi.mock('./getSystemGlobalNodePath');
vi.mock('./log');
vi.mock('./settings');

describe('loadLibrary', () => {
  it('loads library installed locally', async () => {
    const { result, ...rest } = loadLibrary(
      '@commitlint/load',
      resolve(testLibRootPath, 'v11'),
    );

    expect(rest).toEqual({
      fallback: false,
      path: resolve(
        testLibRootPath,
        'v11',
        'node_modules',
        '@commitlint',
        'load',
        'lib',
        'load.js',
      ),
    });

    expect(await result).toMatchObject(expect.any(Function));
  });

  it('loads fallback when local path not specified and global library path not available', async () => {
    const { result, ...rest } = loadLibrary('@commitlint/load', undefined);

    expect(rest).toEqual({
      fallback: true,
    });

    expect(await result).toMatchObject(expect.any(Function));
  });

  it('loads fallback when local installation not available', () => {
    const result = tryLoadDynamicLibrary(
      '@npm/not-a-real-library',
      testLibRootPath,
    );

    expect(result).toBeUndefined();
  });
});
