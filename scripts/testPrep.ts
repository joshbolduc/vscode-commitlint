import { spawnSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';

const main = () => {
  const testProjectRootPath = resolve(__dirname, '..', 'test', 'commitlint');
  const testDirs = readdirSync(testProjectRootPath)
    .map((item) => resolve(testProjectRootPath, item))
    .filter((path) => statSync(path).isDirectory());

  testDirs.forEach((path) => {
    console.log(`Preparing ${path}`);
    spawnSync('npm', ['ci'], { cwd: path, stdio: 'inherit' });
  });
};

if (require.main === module) {
  main();
}
