import { useRef } from 'react';

type Props = { isLoading: boolean; textContent?: string };

export const LoadingSpinner = ({ isLoading, textContent = 'Loading...' }: Props) => {
  const wasLoading = useRef(false);
  const completeMessage = 'Loading complete.';

  let announcement = '';

  if (isLoading) {
    wasLoading.current = true;
    announcement = textContent;
  } else if (wasLoading.current) {
    announcement = completeMessage;
    wasLoading.current = false;
  }

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="govuk-visually-hidden">
        {announcement}
      </div>
      {isLoading && (
        <div className="hods-loading-spinner" aria-hidden="true">
          <div className="hods-loading-spinner__spinner"></div>
          <div className="hods-loading-spinner__content">
            <h1 className="govuk-heading-m">{textContent}</h1>
          </div>
        </div>
      )}
    </>
  );
};
