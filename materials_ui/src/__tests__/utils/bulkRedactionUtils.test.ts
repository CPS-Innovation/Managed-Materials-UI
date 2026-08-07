import { describe, expect, it } from 'vitest';

import type {
  TBulkRedactionDefinition,
  TBulkSearchResponse,
} from '../../materials_components/CaseworkPdfRedactorWrapper/utils/bulkSearchDocumentUtils';
import {
  convertCandidatesToSearchHighlights,
  convertSearchResponseToRedactions,
} from '../../materials_components/PdfRedactor/utils/bulkRedactionUtils';
import type { TRedaction } from '../../materials_components/PdfRedactor/utils/coordUtils';

const PAGE_WIDTH_INCHES = 8.5;
const PAGE_HEIGHT_INCHES = 11;

const aResponse = (redactionDefinitions: TBulkRedactionDefinition[]) =>
  ({ redactionDefinitions }) as TBulkSearchResponse;

const aPage = (
  pageIndex: number,
  redactionCoordinates: TBulkRedactionDefinition['redactionCoordinates'],
): TBulkRedactionDefinition => ({
  pageIndex,
  width: PAGE_WIDTH_INCHES,
  height: PAGE_HEIGHT_INCHES,
  redactionCoordinates,
});

describe('convertSearchResponseToRedactions', () => {
  it('converts a match from inches to points and flips it to a bottom-left origin', () => {
    const redactions = convertSearchResponseToRedactions(
      aResponse([aPage(2, [{ x1: 1, y1: 2, x2: 3, y2: 2.5 }])]),
    );

    expect(redactions).toEqual([
      {
        id: expect.any(String),
        pageNumber: 2,
        pageWidth: 612,
        pageHeight: 792,
        x1: 72,
        y1: 610.9,
        x2: 219,
        y2: 649.1,
      },
    ]);
  });

  it('normalises a box whose corners arrive the wrong way round', () => {
    const [redaction] = convertSearchResponseToRedactions(
      aResponse([aPage(2, [{ x1: 3, y1: 2.5, x2: 1, y2: 2 }])]),
    );

    expect(redaction).toMatchObject({ x1: 72, y1: 610.9, x2: 219, y2: 649.1 });
  });

  it('orders redactions by page, then down the page', () => {
    const redactions = convertSearchResponseToRedactions(
      aResponse([
        aPage(3, [{ x1: 1, y1: 1, x2: 2, y2: 1.5 }]),
        aPage(1, [
          { x1: 1, y1: 8, x2: 2, y2: 8.5 },
          { x1: 1, y1: 1, x2: 2, y2: 1.5 },
        ]),
      ]),
    );

    expect(redactions.map((r) => r.pageNumber)).toEqual([1, 1, 3]);
    expect(redactions[0]!.y1).toBeGreaterThan(redactions[1]!.y1);
  });
});

describe('convertCandidatesToSearchHighlights', () => {
  it('flips a redaction back to a top-left origin highlight', () => {
    const candidate: TRedaction = {
      id: 'candidate-1',
      pageNumber: 2,
      pageHeight: 800,
      pageWidth: 600,
      x1: 100,
      y1: 100,
      x2: 300,
      y2: 200,
    };

    expect(convertCandidatesToSearchHighlights([candidate])).toEqual([
      {
        id: 'candidate-1',
        pageNumber: 2,
        pageHeight: 800,
        pageWidth: 600,
        xLeft: 100,
        xRight: 300,
        yTop: 600,
        yBottom: 700,
      },
    ]);
  });
});
