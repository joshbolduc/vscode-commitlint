# vscode-commitlint

A VS Code extension that integrates [commitlint](https://github.com/conventional-changelog/commitlint) into [VS Code's commit editor](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor).

**[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=joshbolduc.commitlint)**

![Animation of a commit message with linting issues being corrected](images/vscode-commitlint.png)

## Features

- Runs commitlint against your commit message as you write it
- Reports lint [errors and warnings in the editor](https://code.visualstudio.com/docs/editor/editingevolved#_errors-warnings)
- Highlights relevant parts of the commit based on the specific issue
- Autodetects commitlint configuration by default
- Supports all commitlint rules

## Settings

### `commitlint.config.file`

Path to a custom commitlint configuration file. Relative paths are resolved based on the workspace root. Leave blank to auto-detect.

## Requirements

To make the most out of this extension, you'll probably want to configure commitlint in your project and use VS Code as your git commit editor:

- [Getting started with commitlint](https://commitlint.js.org/#/?id=getting-started)
- [VS Code as Git editor](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor)
