import { useMsal } from '@azure/msal-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { useAppRoute } from '..';
import { addCmsReauthInterceptor } from '../../auth/cmsReauth';
import { POLARIS_GATEWAY_URL } from '../../constants/url';
import { loginRequest } from '../../msalInstance';

export const useRequest = () => {
  const { instance: msalInstance } = useMsal();
  const navigate = useNavigate();
  const { getRoute } = useAppRoute();

  const axiosInstance = axios.create({
    baseURL: `${POLARIS_GATEWAY_URL}/api/`,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(async (config) => {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: msalInstance.getActiveAccount()!,
    });

    config.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
    config.headers['Correlation-Id'] = crypto.randomUUID();
    config.headers.ClientName = 'ManageMaterials';

    return config;
  });

  // Registered first so a 401 starts the CMS cookie handoff. A 401 only reaches the handler below
  //  when the loop guard has stopped a repeat handoff, and then shows the auth error page.
  addCmsReauthInterceptor(axiosInstance);

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const errorStatusCodes = [400, 401, 403, 422];

      if (errorStatusCodes.includes(error.status)) {
        return navigate(`/${getRoute('UNAUTHORISED', false)}`);
      }

      if (error.status === 500) {
        // handle 500 errors locally to the request, not redirect to service down page

        if (error.request.responseURL.includes('query')) {
          return Promise.reject(error);
        }

        if (
          !error.request.responseURL.includes('/uma-reclassify') &&
          !/^\/api\/urns\/[^/]+\/cases$/.test(new URL(error.request.responseURL).pathname)
        ) {
          return navigate(`/${getRoute('SERVER_ERROR', false)}`);
        }
      }

      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export const useAxiosInstance = () => {
  const { instance: msalInstance } = useMsal();

  const axiosInstance = axios.create({
    baseURL: `${POLARIS_GATEWAY_URL}/api/`,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(async (config) => {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: msalInstance.getActiveAccount()!,
    });

    config.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
    config.headers['Correlation-Id'] = crypto.randomUUID();
    config.headers.ClientName = 'ManageMaterials';

    return config;
  });

  return addCmsReauthInterceptor(axiosInstance);
};
