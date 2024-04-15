import { dirname } from 'path';
import { getSystemGlobalNodePath } from './getSystemGlobalNodePath';

// This is heinous, but necessary to reverse-engineer the correct `PREFIX` env
// var from the node execPath that will (hopefully) result in the right global
// package location. This is used when loading referenced configurations that
// are installed globally.
//
// @see
// https://github.com/sindresorhus/global-dirs/blob/a9aca465edc840ae1387f1aa9d5dc6de1e944471/index.js
export const getPrefixForLibraryLoad = (
  path: string | undefined,
  globalNodePath: string | undefined,
) => {
  const globalPath = globalNodePath || getSystemGlobalNodePath();
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
