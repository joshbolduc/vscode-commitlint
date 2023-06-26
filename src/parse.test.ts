import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { fixturesPath, testLibRootPath } from '../test/util';
import { parseCommit } from './parse';

jest.mock('./log');
jest.mock('./settings');
jest.mock('./tryGetGitExtensionApi.ts');

describe('parse', () => {
  const versions = readdirSync(testLibRootPath).filter((item) =>
    statSync(resolve(testLibRootPath, item)).isDirectory(),
  );

  const fixtures = [
    [
      'commit-all-ranges.txt',
      {
        ranges: {
          body: [79, 171],
          footer: [173, 184],
          header: [25, 52],
          scope: [30, 35],
          type: [25, 29],
        },
        sanitizedText: `feat(scope): commit subject


Commit body text here.
Commit body text here.
Commit body text here.

Closes #123`,
      },
    ],
    [
      'commit-leading-comment.txt',
      {
        ranges: {
          body: [18, 27],
          header: [10, 16],
        },
        sanitizedText: `Header

Body line`,
      },
    ],
    [
      'commit-leading-comment-newlines.txt',
      {
        ranges: {
          body: [20, 29],
          header: [12, 18],
        },
        sanitizedText: `Header

Body line`,
      },
    ],
    [
      'commit-trailing-comment.txt',
      {
        ranges: {
          body: [8, 17],
          header: [0, 6],
        },
        sanitizedText: `Header

Body line`,
      },
    ],
    [
      'commit-question-comment.txt',
      {
        ranges: {
          body: [18, 27],
          header: [0, 6],
        },
        sanitizedText: `Header

Body line`,
      },
      { commentChar: '?', verbose: false },
    ],
    [
      'commit-scissors.txt',
      {
        ranges: {
          body: [8, 234],
          footer: [236, 247],
          header: [0, 6],
        },
        sanitizedText: `Header

Body line


diff --git a/test.txt b/test.txt
new file mode 100644
index 0000000..e69de29

Closes #123`,
      },
    ],
    [
      'commit-scissors.txt',
      {
        ranges: {
          body: [8, 17],
          header: [0, 6],
        },
        sanitizedText: `Header

Body line`,
      },
      { commentChar: '#', verbose: true },
    ],
    [
      'commit-scissors-empty.txt',
      {
        ranges: {},
        sanitizedText: '',
      },
      { commentChar: '#', verbose: true },
    ],
    [
      'commit-scissors-question-comment.txt',
      {
        ranges: {
          body: [8, 17],
          header: [0, 6],
        },
        sanitizedText: `Header

Body line`,
      },
      { commentChar: '?', verbose: true },
    ],
  ] as const;

  versions.forEach((version) => {
    const libPath = resolve(testLibRootPath, `${version}`);

    fixtures.forEach(
      ([fixture, expected, options = { commentChar: '#', verbose: false }]) => {
        it(`parses ${fixture} using ${version} (${
          options.commentChar
        }, verbose: ${String(options.verbose)})`, async () => {
          const contents = readFileSync(join(fixturesPath, fixture)).toString();

          expect(await parseCommit(contents, libPath, options)).toStrictEqual(
            expected,
          );
        });
      },
    );
  });
});
