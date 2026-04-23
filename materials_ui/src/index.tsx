import '@ministryofjustice/frontend/moj/all.scss';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { App } from './app';

import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import './App.scss';
import { AppContextProvider } from './context/AppContext';
import { FilterProvider } from './context/FiltersContext';
import { msalConfig } from './msalInstance';

if (import.meta.env.DEV && !import.meta.env.VITE_E2E) {
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` }
  });
}

const msalInstance = new PublicClientApplication(msalConfig);

await msalInstance.initialize();
const redirectResult = await msalInstance.handleRedirectPromise();

if (redirectResult?.account) {
  msalInstance.setActiveAccount(redirectResult.account);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MsalProvider instance={msalInstance}>
    <SWRConfig
      value={{
        errorRetryCount: 0,
        revalidateOnFocus: false,
        shouldRetryOnError: false
      }}
    >
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
      >
        <AppContextProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </AppContextProvider>
      </BrowserRouter>
    </SWRConfig>
  </MsalProvider>
);
