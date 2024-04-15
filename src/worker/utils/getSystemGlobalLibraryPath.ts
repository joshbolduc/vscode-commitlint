import { spawnSync } from 'child_process';

let cachedGlobalLibraryPath: string | undefined;

export const getSystemGlobalLibraryPath = () => {
  if (!cachedGlobalLibraryPath) {
    cachedGlobalLibraryPath = spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['root', '-g'],
    )
      .stdout?.toString()
      .trim();
  }
  return cachedGlobalLibraryPath;
};
