import { Link } from 'react-router-dom';

import { PlainLayout } from '../components/Layout/Layout';
import { APP_ROUTES } from '../hooks/ui/useAppRoute';

export const BadRequestPage = ({ reason }: { reason: string }) => {
  return (
    <PlainLayout title="Bad request">
      <h1 className="govuk-heading-l">Sorry, there is a problem with the link</h1>
      <p className="govuk-body">
        The link you followed to open Manage Materials and Communications is not valid.
      </p>
      <p className="govuk-body">
        Go back to where you came from and try again, or{' '}
        <Link to={`/${APP_ROUTES.CASE_SEARCH}`} className="govuk-link">
          search for a case
        </Link>
        .
      </p>

      <div className="govuk-inset-text">HANDOVER_ERROR: {reason}</div>
    </PlainLayout>
  );
};
