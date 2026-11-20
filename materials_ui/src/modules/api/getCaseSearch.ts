import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const getCaseSearchResultSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  versionId: z.number(),
  fileName: z.string(),
  pageIndex: z.number(),
  lineIndex: z.number(),
  pageHeight: z.number(),
  pageWidth: z.number(),
  text: z.string(),
  words: z.array(
    z.object({
      boundingBox: z.array(z.number()).nullable(),
      text: z.string(),
      matchType: z.string(),
    }),
  ),
});

const getCaseSearch = (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  searchTerm: string;
}) =>
  p.axiosInstance.get<unknown>(
    `/cases/${p.caseId}/search/?query=${encodeURIComponent(p.searchTerm)}`,
  );

const tryGetCaseSearch = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  searchTerm: string;
}) => {
  try {
    const response = await getCaseSearch({
      axiosInstance: p.axiosInstance,
      caseId: p.caseId,
      searchTerm: p.searchTerm,
    });
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedCaseSearch = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  searchTerm: string;
}) => {
  const response = await tryGetCaseSearch(p);
  if (!response.success) return { ...response, userMessage: 'Failed to search a case' };

  const parsedResp = getCaseSearchResultSchema.safeParse(response.data);
  if (parsedResp.success) return { ...parsedResp, userMessage: 'Successfully searched a case' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse case search',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
