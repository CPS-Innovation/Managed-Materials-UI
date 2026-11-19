import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

export const documentSchema = z.object({
  parentId: z.string(),
  documentId: z.number().nullish(),
  status: z.string(),
  cmsDocType: z
    .object({
      documentTypeId: z.number(),
      documentType: z.string().nullish(),
      documentCategory: z.string(),
    })
    .nullish(),
  originalFileName: z.string().nullish(),
  subject: z.string().nullish(),
  date: z.string().nullish(),
  isUnused: z.boolean(),
  hasNotes: z.boolean(),
  presentationFlags: z.object({ write: z.union([z.string(), z.boolean()]).nullish() }).nullish(),
});
export const documentListSchema = z.array(documentSchema);

// type TDocument = z.infer<typeof documentSchema>;
// type TDocumentList = z.infer<typeof documentListSchema>;

const getDocumentList = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  return p.axiosInstance.get<unknown>(`/cases/${p.caseId}/documents`);
};

const tryGetDocumentList = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const response = await getDocumentList({ axiosInstance: p.axiosInstance, caseId: p.caseId });
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedDocumentList = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}) => {
  const response = await tryGetDocumentList(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch document list' };

  const parsedResp = documentListSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched document list' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse document list',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
