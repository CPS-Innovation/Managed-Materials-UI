import { AxiosInstance } from 'axios';
import { TDeletion } from '../../PdfRedactor/utils/deletionUtils';

export const saveDeletions = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  childId: number;
  parentId: string;
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
    `/api/cases/${p.caseId}/materials/${p.parentId}/documents/${p.childId}/redact`,
    payload,
  );

  return response.data;
};
