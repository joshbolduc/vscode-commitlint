import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  prettier,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    name: 'vscode-commitlint_eslintConfig',
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        projectService: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      curly: ['error', 'all'],
      'import-x/order': ['warn', { alphabetize: { order: 'asc' } }],
      'object-shorthand': [
        'warn',
        'always',
        {
          ignoreConstructors: false,
          avoidQuotes: true,
        },
      ],
      'sort-imports': [
        'warn',
        { ignoreCase: true, ignoreDeclarationSort: true },
      ],
    },
  },
  {
    // See https://typescript-eslint.io/troubleshooting/typed-linting/performance/#eslint-plugin-import,
    //     https://github.com/un-ts/eslint-plugin-import-x/blob/master/src/config/flat/typescript.ts
    name: 'eslint-plugin-import_tseslint_overrides',
    rules: {
      'import-x/namespace': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'off',
    },
  },
  {
    ignores: ['src/git.d.ts', 'node_modules/**/*', 'dist/**/*', 'out/**/*'],
  },
);
