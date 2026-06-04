import { AxiosInstance } from 'axios';
import { TRotation } from '../../PdfRedactor/utils/rotationUtils';

export const saveRotations = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  childId: number;
  parentId: string;
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
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.parentId}/versions/${p.childId}/modify`,
    payload
  );

  return response.data;
};
