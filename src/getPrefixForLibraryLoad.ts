import { dirname } from 'path';
import { getSystemGlobalNodePath } from './getSystemGlobalNodePath';
import { getGlobalNodePath } from './settings';

// This is heinous, but necessary to reverse-engineer the correct `PREFIX` env
// var from the node execPath that will (hopefully) result in the right global
// package location. This is used when loading referenced configurations that
// are installed globally.
//
// @see
// https://github.com/sindresorhus/global-dirs/blob/a9aca465edc840ae1387f1aa9d5dc6de1e944471/index.js
export const getPrefixForLibraryLoad = (
  commitFilePath: string | undefined,
  loadLibraryPath: string | undefined,
) => {
  const globalNodePathSetting = getGlobalNodePath(commitFilePath);

  // Use the discovered path for `@commitlint/load` if available and no global
  // node path has been specified by the user.
  if (!globalNodePathSetting && loadLibraryPath) {
    return loadLibraryPath;
  }

  const globalPath = globalNodePathSetting || getSystemGlobalNodePath();
  if (globalPath) {
    if (process.platform === 'win32') {
      return dirname(globalPath);
    }
    if (process.execPath.startsWith('/usr/local/Cellar/node')) {
      return '/usr/local';
    }
    return dirname(dirname(globalPath));
  }

  return undefined;
};
