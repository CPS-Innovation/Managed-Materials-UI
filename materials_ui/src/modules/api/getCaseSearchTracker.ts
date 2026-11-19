import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const caseSearchTrackerSchema = z.object({});

const getCaseSearchTracker = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}/tracker`);

const tryGetCaseSearchTracker = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  try {
    const response = await getCaseSearchTracker({
      axiosInstance: p.axiosInstance,
      caseId: p.caseId,
    });
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedCaseSearchTracker = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetCaseSearchTracker(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch case search tracker' };

  const parsedResp = caseSearchTrackerSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched case search tracker' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse case search tracker',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
