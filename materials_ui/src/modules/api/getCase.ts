import { AxiosError, AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const caseSchema = z.object({
  id: z.number(),
  uniqueReferenceNumber: z.string(),
  isCaseCharged: z.boolean(),
  numberOfDefendants: z.number(),
  leadDefendantDetails: z.object({
    id: z.number(),
    firstNames: z.string(),
    surname: z.string(),
    dob: z.string().nullish(),
  }),
  headlineCharge: z.object({ date: z.string().nullable(), nextHearingDate: z.string().nullable() }),
  defendants: z.array(
    z.object({
      id: z.number(),
      charges: z.array(z.object({ id: z.number(), shortDescription: z.string() })),
      proposedCharges: z.array(z.unknown()),
    }),
  ),
});
export const casesSchema = z.array(caseSchema);

const getCase = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}`);

const tryGetCase = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const response = await getCase({ axiosInstance: p.axiosInstance, caseId: p.caseId });
    return { success: true, data: response.data } as const;
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError } as const;
  }
};

export const getParsedCase = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetCase(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch document list' };

  const parsedResp = caseSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched document list' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse document list',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
