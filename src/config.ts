import load from '@commitlint/load';

export function loadConfig(path: string | undefined) {
  return load({}, { cwd: path });
}
