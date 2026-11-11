import useSWR from 'swr';
import { QUERY_KEYS } from '../../constants/query';
import { CaseMaterialDocumentPreviewResponseType } from '../../schemas/caseMaterials';
import { useCaseInfoStore } from '../../stores';
import { useAxiosInstance } from '../ui/useRequest';

export const useDocumentPreview = (p: {
  materialId: number | string;
  documentId?: number | string | null;
  caseId: number | string;
}) => {
  const request = useAxiosInstance();
  const { caseInfo } = useCaseInfoStore();
  const materialIdString = `${p.materialId}`;
  const materialsPrefix = materialIdString.startsWith('CMS-') ? '' : 'CMS-';

  const getDocumentPreview = async () =>
    await request
      .get<CaseMaterialDocumentPreviewResponseType>(
        `/cases/${p.caseId}/materials/${materialsPrefix}${p.materialId}/documents/${p.documentId}/pdf`,
        { responseType: 'blob' },
      )
      .then((response) => response.data);

  const { data, error, isLoading } = useSWR(
    caseInfo ? `${QUERY_KEYS.CASE_MATERIAL_FULL_DOCUMENT}/${materialIdString}` : null,
    getDocumentPreview,
  );

  return { data, loading: isLoading, error };
};
