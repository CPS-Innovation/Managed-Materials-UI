import { FieldErrors } from 'react-hook-form';
import { RedactionLogFormValues } from '../RedactionLogModalBody';

export const ErrorSummary = ({
  errors
}: {
  errors: FieldErrors<RedactionLogFormValues>;
}) => {
  if (Object.keys(errors).length === 0) return null;

  return (
    <div
      className="govuk-error-summary govuk-!-margin-bottom-0"
      data-module="govuk-error-summary"
    >
      <div role="alert">
        <h2 className="govuk-error-summary__title">There is a problem</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors &&
              Object.entries(errors).map(([key, error]) => (
                <li key={key}>
                  <a href="#">{error.message}</a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
