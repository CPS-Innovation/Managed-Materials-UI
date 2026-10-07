import { AxiosInstance } from 'axios';
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAxiosInstance } from '../../caseWorkApp/components/utils/getData';
import { safeJsonParse } from '../../materials_components/DocumentSelectAccordion/utils/generalUtils';
import { CaseSchema } from '../../schemas/caseDetails';

const getCase = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}`).then((response) => response.data);

export const getSafeCase = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const caseData = await getCase(p);
    return CaseSchema.safeParse(caseData);
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const useSafeCase = (p: { caseId: string | number }) => {
  const axiosInstance = useAxiosInstance();
  return useSWR(['getSafeCase', p.caseId], () => getSafeCase({ axiosInstance, caseId: p.caseId }));
};

import { z } from 'zod';

export const readSafeCachedValue = <S extends z.ZodTypeAny>(p: {
  key: string;
  schema: S;
}): ReturnType<S['safeParse']> => {
  const raw = localStorage.getItem(p.key);
  const jsonParsedResp = safeJsonParse(raw);
  if (!jsonParsedResp.success) return jsonParsedResp as ReturnType<S['safeParse']>;
  const schemaParsedResp = p.schema.safeParse(jsonParsedResp.data);
  if (!schemaParsedResp.success) return schemaParsedResp as ReturnType<S['safeParse']>;
  return schemaParsedResp as ReturnType<S['safeParse']>;
};

export const useSafeCase2 = (p: { caseId: string | number }) => {
  const axiosInstance = useAxiosInstance();
  const key = `safeCase-v1-${p.caseId}`;

  const cachedValue = useMemo(() => {
    const safeCachedValueResp = readSafeCachedValue({ key, schema: CaseSchema });
    if (safeCachedValueResp.success) return safeCachedValueResp;
  }, [p.caseId]);

  const rtn = useSWR(key, () => getSafeCase({ axiosInstance, caseId: p.caseId }), {
    fallbackData: cachedValue,
    onSuccess: (result) => {
      if (result.success) localStorage.setItem(key, JSON.stringify(result.data));
    },
  });

  const { data: response, ...rest } = rtn;

  const status = (() => {
    if (response === undefined) return { state: 'loading' } as const;
    if (response.success === false) return { state: 'error', error: response.error } as const;
    return { state: 'success', data: response.data } as const;
  })();

  return { status, ...rest };
};
