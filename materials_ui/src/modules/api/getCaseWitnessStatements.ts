import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const witnessStatementSchema = z.object({ id: z.number(), title: z.number() });
const witnessStatementsSchema = z.array(witnessStatementSchema);

const getCaseWitnessStatementsResponseSchema = z.object({
  statementsForWitness: witnessStatementsSchema,
});

const getCaseWitnessStatements = (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  witnessId: string | number;
}) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}/witnesses/${p.witnessId}/witness-statements`);

const tryGetCaseWitnessStatements = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  witnessId: string | number;
}) => {
  try {
    const response = await getCaseWitnessStatements(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedCaseWitnessStatements = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  witnessId: string | number;
}) => {
  const response = await tryGetCaseWitnessStatements(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch case witnesses' };

  const parsedResp = getCaseWitnessStatementsResponseSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched case witnesses' };
  return {
    ...parsedResp,
    userMessage: 'Failed to parse case witnesses',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
