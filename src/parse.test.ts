import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { fixturesPath, testLibRootPath } from '../test/util';
import { parseCommit } from './parse';

jest.mock('./log');
jest.mock('./settings');

describe('parse', () => {
  const versions = [11, 12, 13];

  const fixtures = [
    'commit-all-ranges.txt',
    'commit-leading-comment.txt',
    'commit-leading-comment-newlines.txt',
    'commit-trailing-comment.txt',
  ];

  versions.forEach((version) => {
    const libPath = resolve(testLibRootPath, `v${version}`);

    fixtures.forEach((fixture) => {
      it(`parses ${fixture} using v${version}`, async () => {
        const contents = readFileSync(join(fixturesPath, fixture)).toString();

        expect(await parseCommit(contents, libPath)).toMatchSnapshot();
      });
    });
  });
});
