const CITATION_BLOCK_RE = /\s*(?:\[(?:\d+(?:\s*[-,]\s*\d+)*)\]\s*)+(?=(?:[.,;:!?)]|\s|$))/g;
const SPACE_BEFORE_PUNCTUATION_RE = /\s+([.,;:!?)](?:\s|$))/g;
const MULTISPACE_RE = /[ \t]{2,}/g;
const SPACE_AROUND_NEWLINE_RE = /[ \t]*\n[ \t]*/g;

export function stripNotebookLmCitations(answer: string): string {
  return answer
    .trim()
    .replace(CITATION_BLOCK_RE, ' ')
    .replace(SPACE_BEFORE_PUNCTUATION_RE, '$1')
    .replace(MULTISPACE_RE, ' ')
    .replace(SPACE_AROUND_NEWLINE_RE, '\n')
    .trim();
}
