import useSWR from 'swr';

import { AxiosInstance } from 'axios';
import { useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { CaseInfoResponseType, CaseInfoSchema } from '../../schemas/caseinfo';

export const getCaseInfo = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance
    .get<CaseInfoResponseType>(`/case-info/${p.caseId}`)
    .then((response) => response.data);

export const getSafeCaseInfo = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  try {
    const caseInfo = await getCaseInfo(p);
    return CaseInfoSchema.safeParse(caseInfo);
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const useCaseInfo = (p: { caseId: string | number }) => {
  const request = useRequest();

  const key = `${QUERY_KEYS.CASE_INFO}-${p.caseId}`;

  const { data, isLoading, isValidating, mutate } = useSWR(key, () =>
    getCaseInfo({ axiosInstance: request, caseId: p.caseId }),
  );

  const caseInfo = (() => {
    if (data) return data;
    if (isLoading) return undefined;
    return null;
  })();

  return { caseInfo, loading: isLoading || isValidating, refresh: mutate };
};
