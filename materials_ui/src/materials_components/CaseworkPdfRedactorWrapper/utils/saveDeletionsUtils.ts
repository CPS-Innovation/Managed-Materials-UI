import { AxiosInstance } from 'axios';
import { TDeletion } from '../../PdfRedactor/utils/deletionUtils';

export const saveDeletions = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  documentId: number;
  materialId: string;
  deletions: TDeletion[];
}) => {
  const payload = {
    redactions: [],
    documentModifications: p.deletions.map((red) => ({
      pageIndex: red.pageNumber,
      operation: 'delete',
    })),
  };

  const response = await p.axiosInstance.put(
    `/cases/${p.caseId}/materials/${p.materialId}/documents/${p.documentId}/redact`,
    payload,
  );

  return response.data;
};
