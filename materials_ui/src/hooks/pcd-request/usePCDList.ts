import useSWR from 'swr';
import { useAppRoute, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { PCDListingResponseType, PCDListingType } from '../../schemas/pcd';

export const usePCDList = () => {
  const request = useRequest();

  const appRoute = useAppRoute();

  const urn = appRoute?.urnPrefix;
  const caseId = appRoute?.caseId?.toString();

  const caseInfo = urn && caseId ? { urn, caseId } : null;

  const getPCDList = async () =>
    await request
      .get<PCDListingResponseType>(`urns/${urn}/cases/${caseId}/pcds/${caseId}/pcd-request-core`)
      .then((response) => response.data);

  const { data, error, isLoading, isValidating } = useSWR(
    caseInfo ? QUERY_KEYS.PCD_REQUESTS : null,
    getPCDList,
  );

  const sortByDate = (a: PCDListingType, b: PCDListingType) =>
    Date.parse(b.decisionRequested) - Date.parse(a.decisionRequested);

  return { data: data?.sort(sortByDate) || undefined, error, isLoading: isLoading || isValidating };
};
