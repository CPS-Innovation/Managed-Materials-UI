import { useMsal } from '@azure/msal-react';
import axios, { AxiosError, AxiosInstance } from 'axios';
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

export const getLookups = async (p: { axiosInstance: AxiosInstance }) => {
  try {
    const response = await p.axiosInstance.get('/api/lookUps');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      console.error(`Error getting lookups: ${error.message}`);
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
  return {
    useAxiosInstance,
    getDocuments,
    getPdfFiles,
    getLookups,
    postRedactionLog
  };
};
