import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const caseInfoSchema = z.object({
  id: z.number(),
  urn: z.string(),
  leadDefendantFirstNames: z.string(),
  leadDefendantSurname: z.string(),
  numberOfDefendants: z.number(),
  unitName: z.string(),
});

const getCaseInfo = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/case-info/${p.caseId}`);

const tryGetCaseInfo = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const response = await getCaseInfo({ axiosInstance: p.axiosInstance, caseId: p.caseId });
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedCaseInfo = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetCaseInfo(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch case info' };

  const parsedResp = caseInfoSchema.safeParse(response.data);
  if (parsedResp.success) return { ...parsedResp, userMessage: 'Successfully fetched case info' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse case info',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
