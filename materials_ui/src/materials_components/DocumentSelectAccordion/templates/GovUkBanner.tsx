type TBannerVariant = 'error' | 'success' | 'info';
const variantClassMap: { [k in TBannerVariant]: string } = {
  error: 'banner-error',
  success: 'govuk-notification-banner--success',
  info: ''
};

export const GovUkBanner = (p: {
  variant: TBannerVariant;
  headerTitle: React.ReactNode;
  headerRight?: React.ReactNode;
  contentHeading?: React.ReactNode;
  contentBody?: React.ReactNode;
}) => {
  const variantClass = variantClassMap[p.variant];
  return (
    <div
      className={`govuk-notification-banner govuk-notification-banner ${variantClass}`}
      role="alert"
      aria-labelledby="govuk-notification-banner-title"
      aria-live="assertive"
      data-module="govuk-notification-banner"
      style={{ margin: 0 }}
    >
      <div
        className="govuk-notification-banner__header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2
          className="govuk-notification-banner__title"
          id="govuk-notification-banner-title"
        >
          {p.headerTitle}
        </h2>
        {p.headerRight && <span>{p.headerRight}</span>}
      </div>
      <div className="govuk-notification-banner__content">
        {p.contentHeading && (
          <h3
            className="govuk-notification-banner__heading"
            style={{ maxWidth: 'none' }}
          >
            {p.contentHeading}
          </h3>
        )}
        {p.contentBody && (
          <p className="govuk-body" style={{ maxWidth: 'none' }}>
            {p.contentBody}
          </p>
        )}
      </div>
    </div>
  );
};
