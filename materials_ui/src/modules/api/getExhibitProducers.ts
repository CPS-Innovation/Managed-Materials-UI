import { AxiosInstance } from 'axios';
import { z } from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const exhibitProducerSchema = z.object({ id: z.number(), producer: z.string() });
const exhibitProducersSchema = z.object({ exhibitProducers: z.array(exhibitProducerSchema) });

const getExhibitProducers = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}/exhibit-producers`);

const tryGetExhibitProducers = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  try {
    const response = await getExhibitProducers(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedExhibitProducers = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetExhibitProducers(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch exhibit producers' };

  const parsedResp = exhibitProducersSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched exhibit producers' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse exhibit producers',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
