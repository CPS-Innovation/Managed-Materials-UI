import { describe, expect, it } from 'vitest';

import {
  convertMatchesToSearchHighlights,
  convertSearchHighlightToRedaction,
  type TSearchHighlight,
} from '../../materials_components/PdfRedactor/utils/searchHighlightUtils';
import type { SearchTermResultType } from '../../schemas/documents';

type TMatch = SearchTermResultType['matches'][number];
type TWord = TMatch['words'][number];

const PADDING_INCHES = 0.03;

const aWord = (overrides: Partial<TWord> = {}): TWord => ({
  text: 'smith',
  matchType: 'Exact',
  boundingBox: [1, 2, 3, 2, 3, 2.5, 1, 2.5],
  ...overrides,
});

const aMatch = (overrides: Partial<TMatch> = {}): TMatch => ({
  text: 'smith',
  pageIndex: 1,
  lineIndex: 0,
  pageHeight: 11,
  pageWidth: 8.5,
  words: [aWord()],
  ...overrides,
});

describe('convertSearchHighlightToRedaction', () => {
  it('flips the y-axis from top-origin highlight coordinates to bottom-origin redaction coordinates', () => {
    const highlight: TSearchHighlight = {
      id: 'highlight-1',
      pageNumber: 3,
      pageHeight: 11,
      pageWidth: 8.5,
      xLeft: 1,
      yTop: 2,
      xRight: 3,
      yBottom: 2.5,
    };

    const redaction = convertSearchHighlightToRedaction(highlight);

    expect(redaction).toEqual({
      id: expect.any(String),
      pageNumber: 3,
      pageHeight: 11,
      pageWidth: 8.5,
      x1: 1,
      y1: 11 - 2.5,
      x2: 3,
      y2: 11 - 2,
    });
  });
});

describe('convertMatchesToSearchHighlights', () => {
  it('converts a word quad into a box from its extreme points, padded on every side', () => {
    const matches = [
      aMatch({ pageIndex: 2, words: [aWord({ boundingBox: [3, 2.5, 1, 2, 3, 2, 1, 2.5] })] }),
    ];

    const [highlight] = convertMatchesToSearchHighlights(matches);

    expect(highlight!.pageNumber).toBe(2);
    expect(highlight!.pageHeight).toBe(11);
    expect(highlight!.pageWidth).toBe(8.5);
    expect(highlight!.xLeft).toBeCloseTo(1 - PADDING_INCHES, 10);
    expect(highlight!.xRight).toBeCloseTo(3 + PADDING_INCHES, 10);
    expect(highlight!.yTop).toBeCloseTo(2 - PADDING_INCHES, 10);
    expect(highlight!.yBottom).toBeCloseTo(2.5 + PADDING_INCHES, 10);
  });

  it('ignores words that are not exact matches or have no bounding box', () => {
    const matches = [
      aMatch({
        words: [
          aWord({ text: 'kept' }),
          aWord({ text: 'fuzzy', matchType: 'Fuzzy' }),
          aWord({ text: 'no-box', boundingBox: null }),
        ],
      }),
    ];

    expect(convertMatchesToSearchHighlights(matches)).toHaveLength(1);
  });

  it('sorts highlights into reading order: page, then top position, then left position', () => {
    const wordAt = (x: number, y: number) =>
      aWord({ boundingBox: [x, y, x + 1, y, x + 1, y + 0.2, x, y + 0.2] });

    const matches = [
      aMatch({ pageIndex: 2, words: [wordAt(1, 1)] }),
      aMatch({ pageIndex: 1, words: [wordAt(4, 5), wordAt(1, 5), wordAt(2, 1)] }),
    ];

    const order = convertMatchesToSearchHighlights(matches).map((h) => ({
      page: h.pageNumber,
      x: Math.round(h.xLeft),
      y: Math.round(h.yTop),
    }));

    expect(order).toEqual([
      { page: 1, x: 2, y: 1 },
      { page: 1, x: 1, y: 5 },
      { page: 1, x: 4, y: 5 },
      { page: 2, x: 1, y: 1 },
    ]);
  });
});
