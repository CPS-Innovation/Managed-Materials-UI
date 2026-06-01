import type { SearchTermResultType } from '../../../schemas/documents';

const PADDING_INCHES = 0.03;

export type TSearchHighlight = {
  id: string;
  pageNumber: number;
  pageHeight: number;
  pageWidth: number;
  xLeft: number;
  yTop: number;
  xRight: number;
  yBottom: number;
};

export type THighlightLayer = {
  highlights: TSearchHighlight[];
  focusedId?: string;
};

export const convertMatchesToSearchHighlights = (
  matches: SearchTermResultType['matches']
): TSearchHighlight[] =>
  matches
    .flatMap((match) =>
      match.words
        .filter((w) => w.matchType?.includes('Exact') && w.boundingBox)
        .map((w) => {
          const xs = [
            w.boundingBox![0]!,
            w.boundingBox![2]!,
            w.boundingBox![4]!,
            w.boundingBox![6]!
          ];
          const ys = [
            w.boundingBox![1]!,
            w.boundingBox![3]!,
            w.boundingBox![5]!,
            w.boundingBox![7]!
          ];
          return {
            id: crypto.randomUUID(),
            pageNumber: match.pageIndex,
            pageHeight: match.pageHeight,
            pageWidth: match.pageWidth,
            xLeft: Math.min(...xs) + PADDING_INCHES,
            xRight: Math.max(...xs) + PADDING_INCHES,
            yTop: Math.min(...ys) - PADDING_INCHES,
            yBottom: Math.max(...ys) + PADDING_INCHES
          };
        })
    )
    .sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
      if (a.yTop !== b.yTop) return a.yTop - b.yTop;
      return a.xLeft - b.xLeft;
    });
