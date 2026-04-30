import { defineConfig } from '@vscode/test-cli';
import { resolve } from 'path';

const projectsRoot = process.env.CLTEST_PROJECTS_ROOT
  ? resolve(process.cwd(), process.env.CLTEST_PROJECTS_ROOT)
  : resolve(import.meta.dirname, 'test/projects');

export default defineConfig([
  {
    label: 'conventional',
    files: 'out/test/**/*.test.js',
    workspaceFolder: resolve(projectsRoot, 'conventional'),
  },
  {
    label: 'conventional-global',
    files: 'out/test/**/*.test.js',
    workspaceFolder: resolve(projectsRoot, 'conventional-global'),
  },
]);
