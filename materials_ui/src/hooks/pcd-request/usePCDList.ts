import useSWR from 'swr';
import { useCaseInfoStore, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { PCDListingResponseType, PCDListingType } from '../../schemas/pcd';

export const usePCDList = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getPCDList = async () =>
    await request
      .get<PCDListingResponseType>(
        `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/pcds/${caseInfo?.id}/pcd-request-core`,
      )
      .then((response) => response.data);

  const { data, error, isLoading, isValidating } = useSWR(
    caseInfo ? QUERY_KEYS.PCD_REQUESTS : null,
    getPCDList,
  );

  const sortByDate = (a: PCDListingType, b: PCDListingType) =>
    Date.parse(b.decisionRequested) - Date.parse(a.decisionRequested);

  return { data: data?.sort(sortByDate) || undefined, error, isLoading: isLoading || isValidating };
};
