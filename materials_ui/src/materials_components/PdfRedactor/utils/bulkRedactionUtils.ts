import type { TBulkSearchResponse } from '../../CaseworkPdfRedactorWrapper/utils/bulkSearchDocumentUtils';
import type { TRedaction } from './coordUtils';
import type { TSearchHighlight } from './searchHighlightUtils';

const POINTS_PER_INCH = 72;

const PADDING_X_POINTS = 3;
const PADDING_Y_POINTS = 1.1;

export const convertSearchResponseToRedactions = (
  resp: TBulkSearchResponse
): TRedaction[] =>
  resp.redactionDefinitions
    .flatMap((def) =>
      def.redactionCoordinates.map((c) => {
        const toPoints = (inches: number) => inches * POINTS_PER_INCH;
        return {
          id: crypto.randomUUID(),
          pageNumber: def.pageIndex,
          pageWidth: toPoints(def.width),
          pageHeight: toPoints(def.height),
          x1: toPoints(Math.min(c.x1, c.x2)),
          y1: toPoints(def.height - Math.max(c.y1, c.y2)) - PADDING_Y_POINTS,
          x2: toPoints(Math.max(c.x1, c.x2)) + PADDING_X_POINTS,
          y2: toPoints(def.height - Math.min(c.y1, c.y2)) + PADDING_Y_POINTS
        };
      })
    )
    .sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
      return b.y1 - a.y1;
    });

export const convertCandidatesToSearchHighlights = (
  candidates: TRedaction[]
): TSearchHighlight[] =>
  candidates.map((c) => ({
    id: c.id,
    pageNumber: c.pageNumber,
    pageHeight: c.pageHeight,
    pageWidth: c.pageWidth,
    xLeft: Math.min(c.x1, c.x2),
    xRight: Math.max(c.x1, c.x2),
    yTop: c.pageHeight - Math.max(c.y1, c.y2),
    yBottom: c.pageHeight - Math.min(c.y1, c.y2)
  }));
