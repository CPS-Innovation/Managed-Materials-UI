import useSWR from 'swr';

import { useAppRoute, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { PCDDetailsResponseType } from '../../schemas/pcd';

type UsePCDProps = { pcdId?: string | number };

export const usePCD = ({ pcdId }: UsePCDProps) => {
  const request = useRequest();

  const appRoute = useAppRoute();

  const urn = appRoute?.urnPrefix;
  const caseId = appRoute?.caseId?.toString();

  const caseInfo = urn && caseId ? { urn, caseId } : null;

  const getPCDDetails = async () =>
    await request
      .get<PCDDetailsResponseType>(`urns/${urn}/cases/${caseId}/pcds/${pcdId}/pcd-request`)
      .then((response) => response.data);

  const { data, error, isLoading, isValidating } = useSWR(
    caseInfo && pcdId ? `${QUERY_KEYS.PCD_REQUEST}/${pcdId}` : null,
    getPCDDetails,
  );

  return { data, error, isLoading: isLoading || isValidating };
};
