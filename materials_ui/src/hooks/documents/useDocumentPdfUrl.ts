import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { stripCmsPrefix } from '../../utils/cmsStringTransform';
import { useAxiosInstance } from '../ui/useRequest';

const getDocumentBlobFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  materialId: string;
}) => {
  try {
    const response = await p.axiosInstance.get(
      `/urns/${p.urn}/cases/${p.caseId}/materials/${p.materialId}/document`,
      { responseType: 'blob' }
    );

    const blob = response.data;
    if (!(blob instanceof Blob)) {
      throw new Error(`Expected Blob but received ${typeof blob}`);
    }

    return { success: true, data: blob } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const useDocumentPdfUrl = (p: {
  urn: string;
  caseId: number;
  materialId: string;
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null | undefined>();
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    (async () => {
      const resp = await getDocumentBlobFromAxiosInstance({
        axiosInstance,
        urn: p.urn,
        caseId: p.caseId,
        materialId: stripCmsPrefix(p.materialId)
      });

      if (!resp.success) return setPdfUrl(null);
      setPdfUrl(URL.createObjectURL(resp.data));
    })();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);
  return { data: pdfUrl };
};
