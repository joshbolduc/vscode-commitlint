# vscode-commitlint

A VS Code extension that integrates [commitlint](https://github.com/conventional-changelog/commitlint) into VS Code's commit editor.

**[Install from the Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=joshbolduc.commitlint)**

![Animation of a commit message with linting issues being corrected](images/vscode-commitlint.png)

## Features

- Runs commitlint against your commit message as you write it
- Reports lint [errors and warnings in the editor](https://code.visualstudio.com/docs/editor/editingevolved#_errors-warnings)
- Highlights relevant parts of the commit based on the specific issue
- Auto detects commitlint configuration by default
- Supports [all commitlint rules](https://commitlint.js.org/#/reference-rules?id=available-rules)
- Adds autocomplete support to `package.json` and `.commitlintrc.json` based on the [configuration schema](https://json.schemastore.org/commitlintrc.json)

## Requirements

This extension assumes you have [configured commitlint in your project](https://commitlint.js.org/#/?id=getting-started). Alternatively, you can configure your own rules using [the `commitlint.config.extend.rules` setting](#commitlintconfigextendrules).

You will also need write your commit messages using VS Code. This extension supports both the [built-in SCM input](https://code.visualstudio.com/docs/editor/versioncontrol#_commit) and the full editor.

### Configuring VS Code to use the full editor for commit messages

If you choose, VS Code can be configured to use the full editor for editing commit messages:

- [When the built-in SCM input is empty, using the `git.useEditorAsCommitInput` setting](https://code.visualstudio.com/updates/v1_69#_author-commit-message-using-an-editor)
- [As the editor for `git` commands spawned in the integrated terminal, using the `git.terminalGitEditor` setting](https://code.visualstudio.com/updates/v1_69#_author-commit-message-using-an-editor)
- [As the default commit editor](https://code.visualstudio.com/docs/editor/versioncontrol#_vs-code-as-git-editor)

## Settings

### `commitlint.config.extend.rules`

Commitlint rules which will be extended.

**Example configuration as JSON syntax:**

```json
"commitlint.config.extend.rules": {
  "body-leading-blank": [1, "always"],
  "body-max-line-length": [2, "always", 100],
  "footer-leading-blank": [1, "always"],
  "footer-max-line-length": [2, "always", 100],
  "header-max-length": [2, "always", 50],
  "scope-case": [2, "always", "lower-case"],
  "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
  "subject-empty": [2, "never"],
  "subject-full-stop": [2, "never", "."],
  "type-case": [2, "always", "lower-case"],
  "type-empty": [2, "never"],
  "type-enum": [
    2,
    "always",
    ["feat", "fix", "docs", "perf", "refactor", "build", "ci", "revert", "style", "test", "chore"]
  ]
}
```

### `commitlint.config.file`

Path to a commitlint configuration file. Relative paths are resolved based on the workspace root. Leave blank to auto-detect.

### `commitlint.globalLibraryPath`

Path to globally installed commitlint libraries, used if locally installed libraries cannot be found. Leave blank to auto-detect.

### `commitlint.globalNodePath`

Path to globally installed node binary, used to load globally installed configurations. Leave blank to auto-detect.

### `commitlint.log.enabled`

Whether to enable logging to the output panel.

### `commitlint.preferBundledLibraries`

Whether to prefer using commitlint libraries bundled with the extension over locally or globally installed versions.
