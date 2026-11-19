import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const documentType = z.object({
  id: z.number(),
  name: z.string(),
  group: z.enum(['Exhibit', 'MG Form', 'Other', 'Statement']),
  category: z.string(),
});

const documentTypesSchema = z.array(documentType);

const getDocumentTypes = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}/document-types`);

const tryGetDocumentTypes = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  try {
    const response = await getDocumentTypes(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedDocumentTypes = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetDocumentTypes(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch document types' };
  const parsedResp = documentTypesSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched document types' };
  return {
    ...parsedResp,
    userMessage: 'Failed to parse document types',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
