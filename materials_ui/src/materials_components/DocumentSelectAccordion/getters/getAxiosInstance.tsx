import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import { getAccessTokenFromMsalInstance } from './getAccessTokenFromMsalInstance';

export const useAxiosInstance = () => {
  const { instance: msalInstance } = useMsal();

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_POLARIS_GATEWAY_URL,
    withCredentials: true
  });

  axiosInstance.interceptors.request.use(async (config) => {
    const accessToken = await getAccessTokenFromMsalInstance(msalInstance);
    config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers['Correlation-Id'] = crypto.randomUUID();
    config.headers.ClientName = 'ManageMaterials';

    return config;
  });

  return axiosInstance;
};
