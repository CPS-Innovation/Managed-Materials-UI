import useSWR from 'swr';
import {
  getPdfBlobFromAxiosInstance,
  useAxiosInstances,
} from '../../caseWorkApp/components/utils/getData';
import { QUERY_KEYS } from '../../constants/query';

export const useDocumentPreview = (p: {
  materialId: string | number;
  caseId: string | number;
  documentId?: string | number;
}) => {
  const { axiosInstance } = useAxiosInstances();

  const getDocumentPreview = async () =>
    getPdfBlobFromAxiosInstance({
      axiosInstance,
      caseId: p.caseId,
      materialId: p.materialId,
      documentId: p.documentId ?? '',
    });

  const { data, error, isLoading } = useSWR(
    `${QUERY_KEYS.CASE_MATERIAL_FULL_DOCUMENT}-${p.caseId}-${p.materialId}-${p.documentId}`,
    getDocumentPreview,
  );

  return { data, loading: isLoading, error };
};
