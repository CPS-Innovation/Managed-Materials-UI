import type { AxiosInstance } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { saveRedactions } from '../../materials_components/CaseworkPdfRedactorWrapper/utils/saveRedactionsUtils';
import type { TRedaction } from '../../materials_components/PdfRedactor/utils/coordUtils';

const REDACT_URL = '/api/urns/45CD0303421/cases/12345/documents/CMS-987/versions/2/redact';

const stubAxios = () => {
  const put = vi.fn().mockResolvedValue({ data: {} });
  return { axiosInstance: { put } as unknown as AxiosInstance, put };
};

const aRedaction = (overrides: Partial<TRedaction> = {}): TRedaction => ({
  id: 'redaction-1',
  pageNumber: 1,
  pageHeight: 842,
  pageWidth: 595,
  x1: 10,
  y1: 20,
  x2: 30,
  y2: 40,
  ...overrides,
});

const save = (redactions: TRedaction[], axiosInstance: AxiosInstance) =>
  saveRedactions({
    axiosInstance,
    urn: '45CD0303421',
    caseId: 12345,
    parentId: 'CMS-987',
    childId: 2,
    redactions,
  });

describe('saveRedactions', () => {
  it('sends every redaction to the document redact endpoint, grouped by page', async () => {
    const { axiosInstance, put } = stubAxios();

    await save(
      [
        aRedaction({ pageNumber: 1, x1: 10, y1: 20, x2: 30, y2: 40 }),
        aRedaction({ pageNumber: 1, x1: 50, y1: 60, x2: 70, y2: 80 }),
        aRedaction({
          pageNumber: 4,
          pageHeight: 595,
          pageWidth: 842,
          x1: 15,
          y1: 25,
          x2: 35,
          y2: 45,
        }),
      ],
      axiosInstance,
    );

    expect(put).toHaveBeenCalledWith(REDACT_URL, {
      redactions: [
        {
          pageIndex: 1,
          height: 842,
          width: 595,
          redactionCoordinates: [
            { x1: 10, y1: 20, x2: 30, y2: 40 },
            { x1: 50, y1: 60, x2: 70, y2: 80 },
          ],
        },
        {
          pageIndex: 4,
          height: 595,
          width: 842,
          redactionCoordinates: [{ x1: 15, y1: 25, x2: 35, y2: 45 }],
        },
      ],
    });
  });
});
