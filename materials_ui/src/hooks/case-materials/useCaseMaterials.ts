import useSWR from 'swr';
import { useCaseInfoStore, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { CaseMaterialDataType, CaseMaterialsResponseType } from '../../schemas';

type UseCaseMaterialsProps = { dataType: CaseMaterialDataType };

export const useCaseMaterials = ({ dataType }: UseCaseMaterialsProps) => {
  const request = useRequest();

  const { caseInfo } = useCaseInfoStore();
  const { urn, id } = caseInfo || {};

  const materialsKey = caseInfo ? [QUERY_KEYS.CASE_MATERIAL, id, urn] : null;

  const getCaseMaterials = async () => {
    const response = await request.get<CaseMaterialsResponseType>(
      `/urns/${urn}/cases/${id}/case-materials`,
    );

    if (response.status === 422 || response.status !== 200) {
      throw new Error(`Validation error: Unable to process ${dataType} request`);
    }

    return response.data;
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
