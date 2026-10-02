import useSWR from 'swr';

import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';
import { useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { CaseInfoResponseType, CaseInfoSchema } from '../../schemas/caseinfo';

export const useCaseInfo = ({ caseId }: { caseId?: number | string }) => {
  const request = useRequest();

  const getCaseInfo = async () =>
    await request
      .get<CaseInfoResponseType>(`/case-info/${caseId}`)
      .then((response) => response.data);

  const { data, isLoading, isValidating, mutate } = useSWR(QUERY_KEYS.CASE_INFO, getCaseInfo);

  return { caseInfo: data || null, loading: isLoading || isValidating, refresh: mutate };
};

const getCaseInfoFromAxiosInstance = (p: {
  axiosInstance: AxiosInstance;
  caseId: number | string;
}) => {
  return p.axiosInstance.get(`/case-info/${p.caseId}`);
};

const safeGetCaseInfoFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number | string;
}) => {
  try {
    const response = await getCaseInfoFromAxiosInstance(p);

    const parsedCaseInfo = CaseInfoSchema.safeParse(response.data);

    return parsedCaseInfo;
  } catch (error) {
    return { success: false, error: error } as const;
  }
};

export const useCaseInfoFromAxiosInstance = (p: {
  axiosInstance: AxiosInstance;
  caseId: number | string;
}) => {
  const [caseInfo, setCaseInfo] = useState<z.infer<typeof CaseInfoSchema> | null>();

  useEffect(() => {
    (async () => {
      const response = await safeGetCaseInfoFromAxiosInstance(p);

      setCaseInfo(response.success ? response.data : null);
    })();
  }, []);

  return { data: caseInfo };
};
