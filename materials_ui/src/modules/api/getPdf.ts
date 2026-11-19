import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const getPdf = (p: {
  axiosInstance: AxiosInstance;
  caseId: number | string;
  materialId: string;
  documentId: number | string;
}) => {
  // send ids with an existing 3 letter prefix as is, otherwise add 'CMS-'
  const materialIdString = `${p.materialId}`;
  const materialsPrefix = materialIdString.startsWith('CMS-') ? '' : 'CMS-';

  return p.axiosInstance.get<unknown>(
    `/cases/${p.caseId}/materials/${materialsPrefix}${p.materialId}/documents/${p.documentId}/pdf`,
    { responseType: 'blob' },
  );
};

const tryGetPdf = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string;
  documentId: number | string;
}) => {
  try {
    const response = await getPdf({
      axiosInstance: p.axiosInstance,
      caseId: p.caseId,
      materialId: p.materialId,
      documentId: p.documentId,
    });
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedPdf = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string;
  documentId: number | string;
}) => {
  const response = await tryGetPdf(p);
  if (!response.success) return { ...response, userMessage: 'Failed to get pdf' };

  const schema = z.instanceof(Blob);
  const parsedResp = schema.safeParse(response.data);

  if (!parsedResp.success) return { ...response, userMessage: 'Failed to parse pdf blob' };
  return { ...response, userMessage: 'Successfully fetched pdf' };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
