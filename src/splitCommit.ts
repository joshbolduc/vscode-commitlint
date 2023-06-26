export const LINE_BREAK = '\n';

export function splitCommit(text: string) {
  return text.split(LINE_BREAK);
}
