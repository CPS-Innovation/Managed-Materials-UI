import { Layout } from '../components';

export const ServerErrorPage = () => {
  return (
    <Layout plain title="Service Unavailable">
      <>
        <h1 className="govuk-heading-l">This service is temporarily unavailable</h1>
        <p className="govuk-body">We are working to restore the service as soon as possible.</p>
        <p className="govuk-body">Please try again later.</p>
      </>
    </Layout>
  );
};
