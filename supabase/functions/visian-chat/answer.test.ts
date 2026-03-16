import { describe, expect, it } from 'vitest';
import { stripNotebookLmCitations } from './answer.ts';

describe('visian-chat answer helpers', () => {
  it('strips inline NotebookLM citations without breaking punctuation', () => {
    const cleaned = stripNotebookLmCitations(
      'Tai sao: Board nay rat yeu [1]. Neu tham econ nua se de vo streak [2][3].',
    );

    expect(cleaned).toBe(
      'Tai sao: Board nay rat yeu. Neu tham econ nua se de vo streak.',
    );
  });

  it('supports citation ranges and keeps paragraph formatting', () => {
    const cleaned = stripNotebookLmCitations(
      'Pick: Kinh Te [1-3]\nTai sao: Can lay loi nay de giu tien [4, 5].',
    );

    expect(cleaned).toBe(
      'Pick: Kinh Te\nTai sao: Can lay loi nay de giu tien.',
    );
  });
});
