import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import { RouteChangeListener } from './components';
import { loginRequest } from './msalInstance';
import { Routes } from './routes';

export const App = () => {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (!instance.getActiveAccount() && accounts.length === 0) {
      instance.loginRedirect(loginRequest).catch(console.error);
    }
  }, [instance, accounts]);

  const account = instance.getActiveAccount() || accounts[0];

  if (!account) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <>
      <div className="govuk-width-container custom-width-container">
        <div className="header-container">
          <cps-global-header></cps-global-header>
        </div>
        <RouteChangeListener />
        <Routes />
      </div>

      <div className="footer-container">
        <footer className="govuk-footer"></footer>
      </div>
    </>
  );
};
