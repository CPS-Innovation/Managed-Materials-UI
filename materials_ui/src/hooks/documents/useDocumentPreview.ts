import useSWR from 'swr';
import { QUERY_KEYS } from '../../constants/query';
import { CaseMaterialDocumentPreviewResponseType } from '../../schemas/caseMaterials';
import { useCaseInfoStore } from '../../stores';
import { useAxiosInstance } from '../ui/useRequest';

type Props = { materialId: number };

export const useDocumentPreview = ({ materialId }: Props) => {
  const request = useAxiosInstance();
  const { caseInfo } = useCaseInfoStore();

  const getDocumentPreview = async () =>
    await request
      .get<CaseMaterialDocumentPreviewResponseType>(
        `/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${materialId}/document`,
        { responseType: 'blob' },
      )
      .then((response) => response.data);

  const { data, error, isLoading } = useSWR(
    caseInfo ? `${QUERY_KEYS.CASE_MATERIAL_FULL_DOCUMENT}/${materialId}` : null,
    getDocumentPreview,
  );

  return { data, loading: isLoading, error };
};
