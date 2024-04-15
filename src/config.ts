import { basename, dirname, isAbsolute } from 'path';

export const getLoadOptions = (
  configFileSetting: string | undefined,
  workspacePath: string | undefined,
  filePath: string | undefined,
) => {
  if (configFileSetting) {
    if (isAbsolute(configFileSetting)) {
      return {
        cwd: dirname(configFileSetting),
        file: basename(configFileSetting),
      };
    }
    return { cwd: workspacePath, file: configFileSetting };
  }

  return { cwd: filePath };
};
