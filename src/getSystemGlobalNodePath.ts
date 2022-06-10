import { spawnSync } from 'child_process';

let cachedNodeExecPath: string | undefined;

export const getSystemGlobalNodePath = () => {
  if (!cachedNodeExecPath) {
    cachedNodeExecPath = (
      spawnSync('node', ['-e', "console.log(require('process').execPath)"])
        .stdout as string | null
    )
      ?.toString()
      .trim();
  }
  return cachedNodeExecPath;
};
