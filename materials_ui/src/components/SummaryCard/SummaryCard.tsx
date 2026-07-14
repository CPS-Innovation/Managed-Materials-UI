export type ContentItem = { key: string; value: unknown };

type Props = { title: string; content: ContentItem[]; actionName?: string; action?: () => void };

export const SummaryCard = ({ title, content, actionName = 'Change', action }: Props) => {
  return (
    <div className="govuk-summary-card">
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title">{title}</h2>
        {action && (
          <ul className="govuk-summary-card__actions">
            <li className="govuk-summary-card__action">
              <a
                className="govuk-link"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  action();
                }}
              >
                {actionName}
              </a>
            </li>
          </ul>
        )}
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list">
          {content.map(({ key, value }, index) => (
            <div className="govuk-summary-list__row" key={index}>
              <dt className="govuk-summary-list__key">{key}</dt>
              <dd className="govuk-summary-list__value">{value as string}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
