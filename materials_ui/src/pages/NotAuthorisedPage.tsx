import NewWindowIcon from '../assets/images/new-window-grey.svg';
import { Layout } from '../components';

export const NotAuthorisedPage = () => {
  return (
    <Layout plain title="Error">
      <>
        <h1 className="govuk-heading-l">Authentication error</h1>

        <p className="govuk-body">
          You have been logged out. Login again at{' '}
          <a
            href="https://cms.cps.gov.uk/CMS"
            className="govuk-link link return-to-cms-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            CMS (opens in new tab)
            <img src={NewWindowIcon} alt="Open in new window" className="new-window-icon" />
          </a>
        </p>
        <p className="govuk-body">
          To return to the case reopen in 'Casework App' and go to 'Bulk UM Classification'.
        </p>

        <div className="govuk-inset-text">CMS_AUTH_ERROR: Unable to connect to CMS.</div>
      </>
    </Layout>
  );
};
