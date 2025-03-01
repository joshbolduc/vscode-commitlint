import { spawnSync, type CommonSpawnOptions } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = () => {
  const testProjectRootPath = resolve(__dirname, '..', 'test', 'commitlint');
  const testDirs = readdirSync(testProjectRootPath)
    .map((item) => resolve(testProjectRootPath, item))
    .filter((path) => statSync(path).isDirectory());

  testDirs.forEach((path) => {
    console.log(`Preparing ${path}`);
    const opts: CommonSpawnOptions = { cwd: path, stdio: 'inherit' };
    if (process.platform === 'win32')
      opts.shell = 'cmd.exe'
    spawnSync('npm', ['ci'], opts);
  });
};

main();
