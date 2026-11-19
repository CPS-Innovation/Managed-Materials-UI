import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

export const witnessSchema = z.object({
  caseId: z.number(),
  firstName: z.string(),
  surname: z.string(),
  witnessId: z.number(),
});

export const witnessesSchema = z.array(witnessSchema);

export const getCaseWitnessesResponseSchema = z.object({ witnesses: witnessesSchema });

const getCaseWitnesses = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}/witnesses?caseId=${p.caseId}`);

const tryGetCaseWitnesses = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  try {
    const response = await getCaseWitnesses(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedCaseWitnesses = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetCaseWitnesses(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch case witnesses' };

  const parsedResp = getCaseWitnessesResponseSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched case witnesses' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse case witnesses',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
