import type { IpcRequestContext } from './ipcTypes';
import {
  getGlobalLibraryPath,
  getGlobalNodePath,
  getPreferBundledLibraries,
} from './settings';

export const getContext = (path: string | undefined) => {
  return {
    path,
    preferBundledLibraries: getPreferBundledLibraries(),
    globalLibraryPath: getGlobalLibraryPath(path),
    globalNodePath: getGlobalNodePath(path),
  } satisfies IpcRequestContext;
};
