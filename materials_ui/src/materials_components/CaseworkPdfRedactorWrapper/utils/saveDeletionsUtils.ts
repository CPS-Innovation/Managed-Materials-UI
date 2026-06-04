import { AxiosInstance } from 'axios';
import { TDeletion } from '../../PdfRedactor/utils/deletionUtils';

export const saveDeletions = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  childId: number;
  documentId: string;
  deletions: TDeletion[];
}) => {
  const payload = {
    redactions: [],
    documentModifications: p.deletions.map((red) => ({
      pageIndex: red.pageNumber,
      operation: 'delete'
    }))
  };

  const response = await p.axiosInstance.put(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.childId}/redact`,
    payload
  );

  return response.data;
};
