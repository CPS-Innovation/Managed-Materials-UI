import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const documentTypeMappingSchema = z.object({
  businessUnits: z.array(
    z.object({ ou: z.string(), areaId: z.string().nullable(), unitId: z.string().nullish() }),
  ),
  documentTypes: z.array(z.object({ cmsDocTypeId: z.string(), docTypeId: z.string() })),
});
const documentTypeMappingListSchema = z.array(documentTypeMappingSchema);

// type DocumentTypeMapping = z.infer<typeof documentTypeMappingSchema>;
// type DocumentTypeMappingList = z.infer<typeof documentTypeMappingListSchema>;

export const getDocumentTypeMappings = async (p: { axiosInstance: AxiosInstance }) => {
  return p.axiosInstance.get<unknown>('/api/polarisMappings');
};

const tryGetDocumentTypeMappings = async (p: { axiosInstance: AxiosInstance }) => {
  try {
    const response = await getDocumentTypeMappings(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedDocumentTypeMappings = (async (p: { axiosInstance: AxiosInstance }) => {
  const response = await tryGetDocumentTypeMappings(p);
  if (!response.success)
    return { ...response, userMessage: 'Failed to fetch document type mappings' };

  const parsedResp = documentTypeMappingListSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched document type mappings' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse document type mappings',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
