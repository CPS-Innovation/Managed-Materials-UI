import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import {
  getPdfBlobFromAxiosInstance,
  useAxiosInstances,
} from '../../caseWorkApp/components/utils/getData';
import { stripCmsPrefix } from '../../utils/cmsStringTransform';

const getDocumentBlobFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  materialId: string;
  documentId: string | number;
}) => {
  try {
    const response = await getPdfBlobFromAxiosInstance({
      axiosInstance: p.axiosInstance,
      caseId: p.caseId,
      materialId: p.materialId,
      documentId: p.documentId,
    });

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
  caseId: number;
  materialId: string;
  documentId: string | number;
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null | undefined>();
  const { axiosInstance } = useAxiosInstances();

  useEffect(() => {
    (async () => {
      const resp = await getDocumentBlobFromAxiosInstance({
        axiosInstance,
        caseId: p.caseId,
        materialId: stripCmsPrefix(p.materialId),
        documentId: p.documentId,
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
