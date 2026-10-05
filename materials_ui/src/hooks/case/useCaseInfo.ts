import useSWR from 'swr';

import { useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { CaseInfoResponseType } from '../../schemas/caseinfo';

export const useCaseInfo = (p: { caseId: string | number }) => {
  const request = useRequest();
  console.log(`useCaseInfo.ts:${/*LL*/ 11}`, p);

  const key = `${QUERY_KEYS.CASE_INFO}-${p.caseId}`;

  const getCaseInfo = async () =>
    await request
      .get<CaseInfoResponseType>(`/case-info/${p.caseId}`)
      .then((response) => response.data);

  const { data, isLoading, isValidating, mutate } = useSWR(key, getCaseInfo);

  return { caseInfo: data || null, loading: isLoading || isValidating, refresh: mutate };
};
