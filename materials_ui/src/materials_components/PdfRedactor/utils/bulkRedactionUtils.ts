import type { TBulkSearchResponse } from '../../CaseworkPdfRedactorWrapper/utils/bulkSearchDocumentUtils';
import type { TRedaction } from './coordUtils';
import type { TSearchHighlight } from './searchHighlightUtils';

const PADDING_X_INCHES = 0.03;
const PADDING_Y_INCHES = 0.015;

export const convertSearchResponseToRedactions = (
  resp: TBulkSearchResponse
): TRedaction[] =>
  resp.redactionDefinitions
    .flatMap((def) =>
      def.redactionCoordinates.map((c) => {
        return {
          id: crypto.randomUUID(),
          pageNumber: def.pageIndex,
          pageWidth: def.width,
          pageHeight: def.height,
          x1: Math.min(c.x1, c.x2) + PADDING_X_INCHES,
          y1: def.height - Math.min(c.y1, c.y2) - PADDING_Y_INCHES,
          x2: Math.max(c.x1, c.x2) + PADDING_X_INCHES,
          y2: def.height - Math.max(c.y1, c.y2) + PADDING_Y_INCHES
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
