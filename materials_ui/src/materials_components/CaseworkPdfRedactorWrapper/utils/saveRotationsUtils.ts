import { AxiosInstance } from 'axios';
import { TRotation } from '../../PdfRedactor/utils/rotationUtils';

export const saveRotations = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  childId: number;
  documentId: string;
  rotations: TRotation[];
}) => {
  const payload = {
    documentModifications: p.rotations.map((rotation) => ({
      pageIndex: rotation.pageNumber,
      operation: 'rotate',
      arg: rotation.rotationDegrees
    }))
  };

  const response = await p.axiosInstance.post(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.childId}/modify`,
    payload
  );

  return response.data;
};
