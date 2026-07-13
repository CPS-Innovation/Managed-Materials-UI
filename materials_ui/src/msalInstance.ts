import { Configuration } from '@azure/msal-browser';
import {
  MSAL_CLIENT_ID,
  MSAL_REDIRECT_URI,
  MSAL_TENANT_ID,
  POLARIS_GATEWAY_SCOPE,
} from './constants/url';

export const msalConfig: Configuration = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT_ID}`,
    redirectUri: MSAL_REDIRECT_URI,
  },
};

export const loginRequest = { scopes: [POLARIS_GATEWAY_SCOPE] };
