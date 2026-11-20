import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const lookupChildSchema = z.object({ id: z.string(), name: z.string() });
const standardLookupItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(lookupChildSchema),
});

const lookupsSchema = z.object({
  areas: z.array(standardLookupItemSchema),
  divisions: z.array(standardLookupItemSchema),
  investigatingAgencies: z.array(standardLookupItemSchema),
  documentTypes: z.array(standardLookupItemSchema.extend({ cmsDocTypeId: z.string() })),
  missedRedactions: z.array(standardLookupItemSchema.extend({ isDeletedPage: z.boolean() })),
  ouCodeMapping: z.array(
    z.object({
      ouCode: z.string(),
      areaCode: z.string(),
      areaName: z.string(),
      investigatingAgencyCode: z.string(),
      investigatingAgencyName: z.string(),
    }),
  ),
});

const getLookups = async (p: { axiosInstance: AxiosInstance }) => {
  return p.axiosInstance.get<unknown>('/api/lookUps');
};

const tryGetLookups = async (p: { axiosInstance: AxiosInstance }) => {
  try {
    const response = await getLookups(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedLookups = (async (p: { axiosInstance: AxiosInstance }) => {
  const response = await tryGetLookups(p);
  if (!response.success) return { ...response, userMessage: 'Failed to fetch lookups' };

  const parsedResponse = lookupsSchema.safeParse(response.data);
  if (parsedResponse.success)
    return { ...parsedResponse, userMessage: 'Successfully fetched lookups' };
  return {
    ...parsedResponse,
    userMessage: 'Failed to parse lookups',
    errorDetails: parsedResponse.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
