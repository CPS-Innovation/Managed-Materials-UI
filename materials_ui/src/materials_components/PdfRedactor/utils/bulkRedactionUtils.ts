import type { TBulkSearchResponse } from '../../CaseworkPdfRedactorWrapper/utils/bulkSearchDocumentUtils';
import type { TRedaction } from './coordUtils';
import type { TSearchHighlight } from './searchHighlightUtils';

const PADDING_INCHES = 0.03;

export const convertSearchResponseToRedactions = (
  resp: TBulkSearchResponse
): TRedaction[] =>
  resp.redactionDefinitions
    .flatMap((def) =>
      def.redactionCoordinates.map((c) => ({
        id: crypto.randomUUID(),
        pageNumber: def.pageIndex,
        pageWidth: def.width,
        pageHeight: def.height,
        x1: c.x1,
        y1: def.height - c.y1,
        x2: c.x2,
        y2: def.height - c.y2
      }))
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
    xLeft: Math.min(c.x1, c.x2) + PADDING_INCHES,
    xRight: Math.max(c.x1, c.x2) + PADDING_INCHES,
    yTop: c.pageHeight - Math.max(c.y1, c.y2) - PADDING_INCHES,
    yBottom: c.pageHeight - Math.min(c.y1, c.y2) + PADDING_INCHES
  }));
