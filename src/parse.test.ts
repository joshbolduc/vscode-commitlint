import { describe, expect, it, vi } from 'vitest';
vi.mock('./log');
vi.mock('./settings');
vi.mock('./tryGetGitExtensionApi.ts');
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