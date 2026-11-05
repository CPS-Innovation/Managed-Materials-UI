import { AxiosInstance } from 'axios';
import { TRotation } from '../../PdfRedactor/utils/rotationUtils';

export const saveRotations = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  documentId: number;
  materialId: string;
  rotations: TRotation[];
}) => {
  const payload = {
    documentModifications: p.rotations.map((rotation) => ({
      pageIndex: rotation.pageNumber,
      operation: 'rotate',
      arg: rotation.rotationDegrees,
    })),
  };

  const response = await p.axiosInstance.post(
    `/cases/${p.caseId}/materials/${p.materialId}/documents/${p.documentId}/modify`,
    payload,
  );

  return response.data;
};
