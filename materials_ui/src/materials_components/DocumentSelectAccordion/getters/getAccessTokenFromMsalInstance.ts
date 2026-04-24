import {
  IPublicClientApplication,
  InteractionRequiredAuthError
} from '@azure/msal-browser';

export const getAccessTokenFromMsalInstance = async (
  msalInstance: IPublicClientApplication,
  scopes?: string[]
) => {
  const account = msalInstance.getActiveAccount();

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({
      scopes: scopes || [import.meta.env.VITE_POLARIS_GATEWAY_SCOPE],
      account: account!
    });

    return tokenResponse.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      const tokenResponse = await msalInstance.acquireTokenPopup({
        scopes: scopes || [import.meta.env.VITE_POLARIS_GATEWAY_SCOPE],
        account: account!
      });
      return tokenResponse.accessToken;
    }

    throw error;
  }
};
