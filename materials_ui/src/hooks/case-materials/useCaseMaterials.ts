import useSWR from 'swr';
import { useAppRoute, useRequest } from '..';
import { useAxiosInstance } from '../../caseWorkApp/components/utils/getData';
import { QUERY_KEYS } from '../../constants/query';
import {
  safeGetDocumentListFromAxiosInstance,
  TDocument,
} from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { CaseMaterialDataType, CaseMaterialsResponseType } from '../../schemas';
import { stripCmsPrefix } from '../../utils/cmsStringTransform';

type UseCaseMaterialsProps = { dataType: CaseMaterialDataType };

export const useCaseMaterials = ({ dataType }: UseCaseMaterialsProps) => {
  const request = useRequest();
  const axiosInstance = useAxiosInstance();

  const { urnPrefix: urn, caseId } = useAppRoute();
  const caseInfo = urn && caseId ? { urn, caseId } : null;

  const materialsKey = caseInfo ? [QUERY_KEYS.CASE_MATERIAL, caseId, urn] : null;

  const getCaseMaterials = async () => {
    const caseMaterialsPromise = request.get<CaseMaterialsResponseType>(
      `/cases/${caseId}/case-materials`,
    );

    const documentsListPromise = safeGetDocumentListFromAxiosInstance({
      axiosInstance,
      urn,
      caseId,
    });

    const [caseMaterialsResponse, documentsListResponse] = await Promise.all([
      caseMaterialsPromise,
      documentsListPromise,
    ]);

    if (caseMaterialsResponse.status !== 200 || !documentsListResponse.success)
      throw new Error(`Validation error: Unable to process ${dataType} request`);

    const indexedDocumentsList: { [k: string]: TDocument } = {};
    documentsListResponse.data.forEach(
      (document) => (indexedDocumentsList[stripCmsPrefix(document.parentId)] = document),
    );

    console.log(`useCaseMaterials.ts:${/*LL*/ 46}`, { indexedDocumentsList });

    const caseMaterials = caseMaterialsResponse.data.map((material) => ({
      ...material,
      documentId: indexedDocumentsList[material.id]?.childId,
    }));

    return caseMaterials;
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR(materialsKey, getCaseMaterials, {
    keepPreviousData: true,
  });

  const filteredData = (data ?? []).filter((material) =>
    dataType === 'communications'
      ? material.category === 'Communication'
      : material.category !== 'Communication',
  );

  const isInitialLoading = !data && isLoading;
  const isRefreshing = !!data && isValidating;

  return { data, loading: isInitialLoading, refreshing: isRefreshing, error, filteredData, mutate };
};
