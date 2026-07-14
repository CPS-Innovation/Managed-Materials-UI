import { ReactNode, useState } from 'react';
import './Accordion.scss';

type AccordionItemProps = {
  title: { expanded: string; collapsed: string };
  content: ReactNode;
  index: number;
};

type AccordionProps = { items: Omit<AccordionItemProps, 'index'>[]; plain?: boolean };

export const AccordionItem = ({ title, content, index }: AccordionItemProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const itemId = index + 1;
  const titleTxt = isExpanded ? title.expanded : title.collapsed;

  return (
    <div>
      <div className="govuk-accordion__section">
        <div className="govuk-accordion__section-header">
          <h2 className="govuk-accordion__section-heading">
            <button
              type="button"
              aria-controls={`accordion-default-content-${itemId}`}
              className="govuk-accordion__section-button"
              aria-expanded={isExpanded}
              aria-label={titleTxt}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="govuk-accordion__section-toggle">
                <span className="govuk-accordion__section-toggle-focus">
                  <span
                    className={`govuk-accordion-nav__chevron${!isExpanded ? ' govuk-accordion-nav__chevron--down' : ''}`}
                  ></span>
                  <span className="govuk-accordion__section-toggle-text">{titleTxt}</span>
                </span>
              </span>
            </button>
          </h2>
        </div>
      </div>
      <div id={`accordion-default-content-${index}`} hidden={!isExpanded}>
        {content}
      </div>
    </div>
  );
};

export const Accordion = ({ items = [], plain = false }: AccordionProps) => {
  return (
    <div
      className={`govuk-accordion${plain ? ' govuk-accordion--plain' : ''}`}
      data-testid="accordion"
    >
      {items.map((item, index) => (
        <AccordionItem title={item.title} content={item.content} index={index} key={index} />
      ))}
    </div>
  );
};
