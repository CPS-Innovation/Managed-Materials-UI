import { useMsal } from '@azure/msal-react';
import axios, { AxiosError, AxiosInstance } from 'axios';
import z from 'zod';
import { getAccessTokenFromMsalInstance } from '../../../materials_components/DocumentSelectAccordion/getters/getAccessTokenFromMsalInstance';
import { RedactionLogData } from '../../types/redactionLog';

export const useAxiosInstances = () => {
  const { instance: msalInstance } = useMsal();

  const createInstance = (baseURL: string, scopes?: string[]) => {
    const instance = axios.create({ baseURL, withCredentials: true });
    instance.interceptors.request.use(async (config) => {
      const accessToken = await getAccessTokenFromMsalInstance(
        msalInstance,
        scopes
      );
      config.headers.Authorization = `Bearer ${accessToken}`;
      config.headers['Correlation-Id'] = crypto.randomUUID();
      return config;
    });
    return instance;
  };

  const redactionLogScope = import.meta.env.VITE_REDACTION_LOG_SCOPE;

  return {
    axiosInstance: createInstance(import.meta.env.VITE_POLARIS_GATEWAY_URL),
    redactionLogAxios: createInstance(
      import.meta.env.VITE_REDACTION_LOG_URL,
      redactionLogScope ? [redactionLogScope] : undefined
    )
  };
};

export const useAxiosInstance = () => useAxiosInstances().axiosInstance;

export const getDocuments = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  try {
    const response = await p.axiosInstance.get(
      `/api/urns/${p.urn}/cases/${p.caseId}/documents`
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      console.error(`Error getting documents: ${error.message}`);
  }
};

export const getPdfFiles = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number | string;
  documentId: number | string;
  versionId?: number | string;
}): Promise<Blob> => {
  try {
    const response = await p.axiosInstance.get(
      `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.versionId}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`Error getting PDF file: ${error.message}`);
    }
    throw error;
  }
};

export const lookupsSchema = z.object({
  areas: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      children: z.array(z.object({ id: z.string(), name: z.string() }))
    })
  ),
  divisions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      children: z.array(z.object({ id: z.string(), name: z.string() }))
    })
  ),
  documentTypes: z.array(
    z.object({ id: z.string(), name: z.string(), cmsDocTypeId: z.string() })
  ),
  investigatingAgencies: z.array(
    z.object({ id: z.string(), name: z.string() })
  ),
  missedRedactions: z.array(
    z.object({ id: z.string(), name: z.string(), isDeletedPage: z.boolean() })
  ),
  ouCodeMapping: z.array(
    z.object({
      ouCode: z.string(),
      areaCode: z.string(),
      areaName: z.string(),
      investigatingAgencyCode: z.string(),
      investigatingAgencyName: z.string()
    })
  ),
  polarisInvestigatingAgencies: z.array(
    z.object({ ouCode: z.string(), investigatingAgencyId: z.string() })
  ),
  businessUnits: z.array(
    z.object({
      ou: z.string(),
      areaId: z.string().nullable(),
      unitId: z.string().nullable()
    })
  )
});

export type TLookups = z.infer<typeof lookupsSchema>;

export const safeGetLookups = async (p: { axiosInstance: AxiosInstance }) => {
  try {
    const response = await p.axiosInstance.get('/api/lookUps');
    const parsed = lookupsSchema.safeParse(response.data);
    return parsed;
  } catch (error) {
    if (error instanceof AxiosError)
      console.error(`Error getting lookups: ${error.message}`);

    return { success: false, error } as const;
  }
};

export const postRedactionLog = async (p: {
  axiosInstance: AxiosInstance;
  data: RedactionLogData;
}) => {
  try {
    const response = await p.axiosInstance.post('/api/redactionLogs', p.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      console.error(`Error posting redaction log: ${error.message}`);
    throw error;
  }
};

export const GetDataFromAxios = () => {
  return { useAxiosInstance, getDocuments, getPdfFiles, postRedactionLog };
};
