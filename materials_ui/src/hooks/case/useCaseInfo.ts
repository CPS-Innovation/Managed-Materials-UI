import useSWR from 'swr';

import { useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { CaseInfoResponseType } from '../../schemas/caseinfo';

type UseCaseInfoProps = { caseId?: number | string; urn?: string };

export const useCaseInfo = ({ caseId, urn }: UseCaseInfoProps) => {
  const request = useRequest();

  const key = caseId && urn ? QUERY_KEYS.CASE_INFO : null;

  const getCaseInfo = async () =>
    await request
      .get<CaseInfoResponseType>(`/urns/${urn}/case-info/${caseId}`)
      .then((response) => response.data);

  const { data, isLoading, isValidating, mutate } = useSWR(key, getCaseInfo);

  return { caseInfo: data || null, loading: isLoading || isValidating, refresh: mutate };
};
