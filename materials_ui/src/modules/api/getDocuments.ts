import { AxiosError, AxiosInstance } from 'axios';
import { documentListSchema } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { ApiParsedResponseBaseType } from './_helpers';

const getDocumentList = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  return p.axiosInstance.get(`/cases/${p.caseId}/documents`);
};

const tryGetDocumentList = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const response = await getDocumentList({ axiosInstance: p.axiosInstance, caseId: p.caseId });
    return { success: true, data: response.data } as const;
  } catch (error) {
    const axiosError = error as AxiosError;
    return { success: false, error: axiosError } as const;
  }
};

export const getParsedDocumentList = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
}): Promise<ApiParsedResponseBaseType> => {
  const response = await tryGetDocumentList(p);
  if (!response.success) return { ...response, userMessage: 'Failed to get document list' };

  const parsedResp = documentListSchema.safeParse(response.data);
  if (parsedResp.success)
    return { ...parsedResp, userMessage: 'Successfully fetched document list' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse document list',
    errorDetails: parsedResp.error.issues,
  };
};
