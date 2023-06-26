import type { Commit } from '@commitlint/types';
import { importCommitlintParse } from './loadLibrary';

type KnownSection = 'header' | 'body' | 'footer' | 'scope' | 'subject' | 'type';

type Range = [start: number, end: number];

type SectionRanges = Partial<Record<KnownSection, Range>>;

const LINE_BREAK = '\n';

const EMPTY_COMMIT: Readonly<Commit> = {
  raw: '',
  header: '',
  type: null,
  scope: null,
  subject: null,
  body: null,
  footer: null,
  mentions: [],
  notes: [],
  references: [],
  revert: undefined,
  merge: undefined,
};

function splitCommit(text: string) {
  return text.split(LINE_BREAK);
}

interface Offset {
  index: number;
  length: number;
}

function getCommitRanges(commit: Readonly<Commit>) {
  const text = commit.raw;

  const ranges: SectionRanges = {};

  if (commit.header) {
    const headerStart = text.indexOf(commit.header);
    const headerEnd = headerStart + commit.header.length;
    ranges.header = [headerStart, headerEnd];
  }

  const [headerStart, headerEnd] = ranges.header ?? [0, 0];

  if (commit.body) {
    const bodyStart = text.indexOf(commit.body, headerEnd);
    const bodyEnd = bodyStart + commit.body.length;
    ranges.body = [bodyStart, bodyEnd];
  }

  if (commit.footer) {
    const footerStart = text.lastIndexOf(commit.footer);
    const footerEnd = footerStart + commit.footer.length;
    ranges.footer = [footerStart, footerEnd];
  }

  if (commit.type) {
    const typeStart = headerStart + commit.header.indexOf(commit.type);
    const typeEnd = headerStart + typeStart + commit.type.length;
    ranges.type = [typeStart, typeEnd];
  }

  if (commit.scope) {
    const scopeStart =
      headerStart + commit.header.indexOf(`(${commit.scope})`) + 1;
    const scopeEnd = headerStart + scopeStart + commit.scope.length;
    ranges.scope = [scopeStart, scopeEnd];
  }

  return ranges;
}

export async function parseCommit(
  text: string,
  path: string | undefined,
  { commentChar }: { commentChar: string | undefined },
) {
  function isCommentLine(line: string) {
    return commentChar && line.startsWith(commentChar);
  }

  function isValidLine(line: string) {
    return !isCommentLine(line) && line !== '';
  }

  const lines = splitCommit(text);

  const firstContentLine = lines.findIndex(isValidLine);
  const lastContentLine = lines.reduceRight((prev, cur, i) => {
    if (prev === i && !isValidLine(cur)) {
      return i - 1;
    }

    return prev;
  }, lines.length - 1);

  const sanitizedText = lines
    .slice(firstContentLine, lastContentLine + 1)
    .filter((line) => !isCommentLine(line))
    .join(LINE_BREAK);

  const parse = importCommitlintParse(path);

  // parse will throw on empty commit messages
  const commit =
    sanitizedText === '' ? EMPTY_COMMIT : await parse(sanitizedText);
  const originalRanges = getCommitRanges(commit);

  const { offsets } = lines.reduce<{
    offsets: Offset[];
    index: number;
  }>(
    (acc, cur, i) => {
      const lineLength = cur.length + LINE_BREAK.length;

      const shouldIncludeLine =
        i >= firstContentLine && i <= lastContentLine && !isCommentLine(cur);

      if (shouldIncludeLine) {
        acc.index += lineLength;
      } else {
        acc.offsets.push({
          index: acc.index,
          length: lineLength,
        });
      }

      return acc;
    },
    { offsets: [], index: 0 },
  );

  const ranges = Object.entries(originalRanges).reduce<SectionRanges>(
    (acc, [section, sectionRange]) => {
      if (sectionRange) {
        const [start, end] = sectionRange;

        const adjustedRange = offsets.reduce<Range>(
          ([accStart, accEnd], { index, length }) => {
            const startOffset = index <= start ? length : 0;
            const endOffset = index < end ? length : 0;

            return [accStart + startOffset, accEnd + endOffset];
          },
          [start, end],
        );

        acc[section as keyof typeof ranges] = adjustedRange;
      }

      return acc;
    },
    {},
  );

  return { ranges, sanitizedText };
}
