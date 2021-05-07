import { readFileSync } from 'fs';
import { join } from 'path';
import { parseCommit } from './parse';

describe('parse', () => {
  const fixtures = [
    'commit-all-ranges.txt',
    'commit-leading-comment.txt',
    'commit-leading-comment-newlines.txt',
    'commit-trailing-comment.txt',
  ];

  fixtures.forEach((fixture) => {
    it(`parses ${fixture}`, async () => {
      const contents = readFileSync(
        join(__dirname, '..', 'test', 'fixtures', fixture),
      ).toString();

      expect(await parseCommit(contents)).toMatchSnapshot();
    });
  });
});
