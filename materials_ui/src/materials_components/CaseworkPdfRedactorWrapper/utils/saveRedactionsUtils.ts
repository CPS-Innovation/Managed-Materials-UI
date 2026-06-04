import { AxiosInstance } from 'axios';
import { TRedaction } from '../../PdfRedactor/utils/coordUtils';

export const saveRedactions = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  childId: number;
  documentId: string;
  redactions: TRedaction[];
}) => {
  const redactionsIndexedOnPageNumber: { [k: number]: TRedaction[] } = {};
  p.redactions.forEach(
    (red) => (redactionsIndexedOnPageNumber[red.pageNumber] = [])
  );
  p.redactions.forEach((red) =>
    redactionsIndexedOnPageNumber[red.pageNumber]!.push(red)
  );
  const payload = {
    redactions: Object.values(redactionsIndexedOnPageNumber).map((reds) => {
      const first = reds[0]!;

      return {
        pageIndex: first.pageNumber,
        height: first.pageHeight,
        width: first.pageWidth,
        redactionCoordinates: reds.map((red) => {
          return { x1: red.x1, y1: red.y1, x2: red.x2, y2: red.y2 };
        })
      };
    })
  };
  const response = await p.axiosInstance.put(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.childId}/redact`,
    payload
  );

  return response.data;
};
