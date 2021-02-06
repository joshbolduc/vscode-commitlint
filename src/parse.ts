import parse from '@commitlint/parse';
import { Commit } from '@commitlint/types';

type KnownSection = 'header' | 'body' | 'footer' | 'scope' | 'subject' | 'type';

type Range = [start: number, end: number];

type SectionRanges = Partial<Record<KnownSection, Range>>;

export async function parseCommit(text: string) {
  return parse(text);
}

function isCommentLine(line: string) {
  // TODO: this is actually configurable per git config. see:
  // https://stackoverflow.com/questions/22936252/escape-comment-character-in-git-commit-message
  const commentChar = '#';

  return line.startsWith(commentChar);
}

const LINE_BREAK = '\n';

function splitCommit(text: string) {
  return text.split(LINE_BREAK);
}

export function getCleanText(text: string) {
  const lines = splitCommit(text);

  const sanitizedText = lines
    .filter((line) => !isCommentLine(line))
    .join(LINE_BREAK);

  return sanitizedText;
}

interface Offset {
  index: number;
  length: number;
}

export function getAdjustedRanges(ranges: SectionRanges, originalText: string) {
  const { offsets } = splitCommit(originalText).reduce<{
    offsets: Offset[];
    index: number;
  }>(
    (acc, cur) => {
      const lineLength = cur.length + LINE_BREAK.length;

      if (isCommentLine(cur)) {
        acc.offsets.push({
          index: acc.index,
          length: lineLength,
        });
      } else {
        acc.index += lineLength;
      }

      return acc;
    },
    { offsets: [], index: 0 },
  );

  return Object.entries(ranges).reduce<SectionRanges>(
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
}

export function getCommitRanges(commit: Commit) {
  const text = commit.raw;

  const headerStart = text.indexOf(commit.header);
  const headerEnd = headerStart + commit.header.length;

  const ranges: SectionRanges = {
    header: [headerStart, headerEnd],
  };

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
