# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.5.1](https://github.com/joshbolduc/vscode-commitlint/compare/v2.5.0...v2.5.1) (2024-03-08)

### Bug Fixes

- gracefully handle ESM modules ([dc6a417](https://github.com/joshbolduc/vscode-commitlint/commit/dc6a417060a27275a6f64d90f173c93399524972))
- roll back bundled commitlint to v18 ([3fe7f61](https://github.com/joshbolduc/vscode-commitlint/commit/3fe7f613080692523121cf2fbd4caa8212a57b04))

## [2.5.0](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.7...v2.5.0) (2024-03-03)

### Features

- update bundled commitlint to v19 ([025d4a7](https://github.com/joshbolduc/vscode-commitlint/commit/025d4a729f4c9fd2230807c70bd9f0dbe2c175f1))

### Bug Fixes

- use dynamic import instead of `require` to support commitlint v19 ([9e9a7f1](https://github.com/joshbolduc/vscode-commitlint/commit/9e9a7f19173b4f0b95d0f3020e3fd6e9f01d031e)), closes [#753](https://github.com/joshbolduc/vscode-commitlint/issues/753)

### [2.4.7](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.6...v2.4.7) (2023-09-04)

### [2.4.6](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.5...v2.4.6) (2023-07-10)

### Bug Fixes

- fix handling of unset comment char ([f971003](https://github.com/joshbolduc/vscode-commitlint/commit/f971003483e3771f2b2edf9c1123b14c12910135))

### [2.4.5](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.4...v2.4.5) (2023-06-27)

### Bug Fixes

- log error when git extension can't be loaded ([db21142](https://github.com/joshbolduc/vscode-commitlint/commit/db21142b89509989627a9912d9f401299aafe8ef))
- support git `core.commentChar` config ([d03a694](https://github.com/joshbolduc/vscode-commitlint/commit/d03a694c055f9f57e1946bc379413fb463b6129d))
- support verbose commits ([4dc32df](https://github.com/joshbolduc/vscode-commitlint/commit/4dc32df1ca0c63f20b6bda5466cc10f422a97667)), closes [#593](https://github.com/joshbolduc/vscode-commitlint/issues/593)

### [2.4.4](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.3...v2.4.4) (2023-06-25)

### Bug Fixes

- support plugins and additional config properties ([38d3080](https://github.com/joshbolduc/vscode-commitlint/commit/38d3080ef671dac060a88157d20c97a353ac7aa1)), closes [#730](https://github.com/joshbolduc/vscode-commitlint/issues/730)

### [2.4.3](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.2...v2.4.3) (2023-06-20)

### Bug Fixes

- prefer local library path as PREFIX ([c1ba4d0](https://github.com/joshbolduc/vscode-commitlint/commit/c1ba4d04306e228ddcf4a006883d7296562fc449)), closes [#600](https://github.com/joshbolduc/vscode-commitlint/issues/600) [#744](https://github.com/joshbolduc/vscode-commitlint/issues/744)
- search for packages under `commitlint` ([713c899](https://github.com/joshbolduc/vscode-commitlint/commit/713c8998afedad4bf8cd32e8a373ee52e57cc3db))

### [2.4.2](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.1...v2.4.2) (2023-01-16)

### Bug Fixes

- don't reset `PREFIX` env var to undefined ([5cbaa02](https://github.com/joshbolduc/vscode-commitlint/commit/5cbaa027a8e2aee07d469f1baf0d5543e8c9cd17)), closes [#621](https://github.com/joshbolduc/vscode-commitlint/issues/621)

### [2.4.1](https://github.com/joshbolduc/vscode-commitlint/compare/v2.4.0...v2.4.1) (2022-09-05)

### Bug Fixes

- support new vscode-scm scheme ([ab431d2](https://github.com/joshbolduc/vscode-commitlint/commit/ab431d23f7ed3dc6d963a8707c7b75494f3594d0)), closes [/github.com/microsoft/vscode/issues/35571#issuecomment-1195219643](https://github.com/joshbolduc//github.com/microsoft/vscode/issues/35571/issues/issuecomment-1195219643)

## [2.4.0](https://github.com/joshbolduc/vscode-commitlint/compare/v2.3.0...v2.4.0) (2022-07-17)

### Features

- support linting built-in SCM input ([1ca6f47](https://github.com/joshbolduc/vscode-commitlint/commit/1ca6f47f74de543da4a055d2f934cabfc86d381a))

## [2.3.0](https://github.com/joshbolduc/vscode-commitlint/compare/v2.2.0...v2.3.0) (2022-06-16)

### Features

- improve detection of installed commitlint libraries ([2a1f11b](https://github.com/joshbolduc/vscode-commitlint/commit/2a1f11b83302eecaecc73a4719ccef29a9ab05c5)), closes [#491](https://github.com/joshbolduc/vscode-commitlint/issues/491)

## [2.2.0](https://github.com/joshbolduc/vscode-commitlint/compare/v2.1.0...v2.2.0) (2022-03-05)

### Features

- use language status instead of status bar ([980d542](https://github.com/joshbolduc/vscode-commitlint/commit/980d542171a7a1147896035dfad7a8d3a132c37b))

## [2.1.0](https://github.com/joshbolduc/vscode-commitlint/compare/v2.0.0...v2.1.0) (2021-12-27)

### Features

- update bundled commitlint to v16 ([9ab3f3a](https://github.com/joshbolduc/vscode-commitlint/commit/9ab3f3a574fb6d7b8eea849b8857c9bd8b39b716))

## [2.0.0](https://github.com/joshbolduc/vscode-commitlint/compare/v1.4.0...v2.0.0) (2021-07-29)

### ⚠ BREAKING CHANGES

- The extension now attempts to use locally installed
  copies of commitlint libraries to load commitlint configurations, parse
  commit messages, and apply linting rules. If locally installed libraries
  are not available, versions of those libraries bundled with the
  extension will be used instead, as they were previously.
- The bundled version of commitlint is now version 13
  (updated from 11).

### Features

- add setting to enable/disable logging ([9535550](https://github.com/joshbolduc/vscode-commitlint/commit/953555008d7f0df4d955c76c89c6978f613e04dc))
- dynamically load local commitlint ([10631dc](https://github.com/joshbolduc/vscode-commitlint/commit/10631dc093b6a5518f0452cc29d93ebfacba59db)), closes [#113](https://github.com/joshbolduc/vscode-commitlint/issues/113)
- surface helpUrl from config via diagnostics ([f52617a](https://github.com/joshbolduc/vscode-commitlint/commit/f52617ad75539bc9c809c8a548f155771eea9dcb))
- update commitlint to v13 ([a53bf62](https://github.com/joshbolduc/vscode-commitlint/commit/a53bf62dd13d6473aacfef45364a3e6a575175ff))

## [1.4.0](https://github.com/joshbolduc/vscode-commitlint/compare/v1.3.2...v1.4.0) (2021-05-29)

### Features

- contribute commitlint config json schema ([1e1e0c1](https://github.com/joshbolduc/vscode-commitlint/commit/1e1e0c112122d3b6b8d70c77168469bd841f3e84))

### Bug Fixes

- fix incorrect status bar info ([59557e1](https://github.com/joshbolduc/vscode-commitlint/commit/59557e1254262a45862af3620404ef2e305187fa))

### [1.3.2](https://github.com/joshbolduc/vscode-commitlint/compare/v1.3.1...v1.3.2) (2021-05-12)

### Bug Fixes

- support config file as absolute path ([#89](https://github.com/joshbolduc/vscode-commitlint/issues/89)) ([2a6284a](https://github.com/joshbolduc/vscode-commitlint/commit/2a6284a3f1d6326e52d5cb45e577d232ad842ded))

### [1.3.1](https://github.com/joshbolduc/vscode-commitlint/compare/v1.3.0...v1.3.1) (2021-05-07)

### Bug Fixes

- change node version target ([3d764e4](https://github.com/joshbolduc/vscode-commitlint/commit/3d764e4660e739ac8bfcab80c3691d74b7f09e78))
- disable extension in untrusted workspaces ([ddc9e5c](https://github.com/joshbolduc/vscode-commitlint/commit/ddc9e5cdafe7a449eae7e0b76fb0cd7d54894c59)), closes [#109](https://github.com/joshbolduc/vscode-commitlint/issues/109)
- trim leading newlines before parsing ([c6456f2](https://github.com/joshbolduc/vscode-commitlint/commit/c6456f2b185c4ccb6d6eb70f79a618b92002aead)), closes [#108](https://github.com/joshbolduc/vscode-commitlint/issues/108)

## [1.3.0](https://github.com/joshbolduc/vscode-commitlint/compare/v1.2.1...v1.3.0) (2021-05-06)

### Features

- support extend rules ([#90](https://github.com/joshbolduc/vscode-commitlint/issues/90)) ([cb14bb1](https://github.com/joshbolduc/vscode-commitlint/commit/cb14bb1f11e05bf11e92350b56f1a0e02d6b93a4))

### [1.2.1](https://github.com/joshbolduc/vscode-commitlint/compare/v1.2.0...v1.2.1) (2021-04-06)

### Bug Fixes

- use workspace config for non-file schemes ([097237e](https://github.com/joshbolduc/vscode-commitlint/commit/097237eae14569c327e845453d6e9155cc1d4828)), closes [#69](https://github.com/joshbolduc/vscode-commitlint/issues/69)

## [1.2.0](https://github.com/joshbolduc/vscode-commitlint/compare/v1.1.0...v1.2.0) (2021-02-18)

### Features

- support loading custom config via settings ([4c9ba21](https://github.com/joshbolduc/vscode-commitlint/commit/4c9ba21020254841d50f1bd6096f5a8339b87225)), closes [#20](https://github.com/joshbolduc/vscode-commitlint/issues/20)

## [1.1.0](https://github.com/joshbolduc/vscode-commitlint/compare/v1.0.2...v1.1.0) (2021-02-13)

### Features

- add extension icon ([51772d8](https://github.com/joshbolduc/vscode-commitlint/commit/51772d84fc799a1feb30ccc0d35c07b837ee3634))
- support linting untitled files ([d2bbc6c](https://github.com/joshbolduc/vscode-commitlint/commit/d2bbc6c4d304c752653b04adc024b3757de4bc14))

### Bug Fixes

- fix status bar icon flickering ([974a00c](https://github.com/joshbolduc/vscode-commitlint/commit/974a00c5308d0a178d4301056828b43d39657ece))

### [1.0.2](https://github.com/joshbolduc/vscode-commitlint/compare/v1.0.1...v1.0.2) (2021-02-07)

### Bug Fixes

- exclude .github dir from packaged extension ([80a829a](https://github.com/joshbolduc/vscode-commitlint/commit/80a829a3a3eef4cd45d09a7e1c3941237627e75d))

### [1.0.1](https://github.com/joshbolduc/vscode-commitlint/compare/v1.0.0...v1.0.1) (2021-02-07)

### Bug Fixes

- fix README image path in package ([da7e5ad](https://github.com/joshbolduc/vscode-commitlint/commit/da7e5ade6557caf9e61677fb15d426101db2179a))

## 1.0.0 (2021-02-07)

### Features

- initial version ([8109038](https://github.com/joshbolduc/vscode-commitlint/commit/810903895f3f7705b7b18d9a8071aa97ee131f8b))
