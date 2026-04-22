import { ReactNode, useEffect, useRef, useState } from 'react';
import z from 'zod';
import { safeJsonParse } from '../utils/generalUtils';
import './GovUkAccordion.scss';

const safeGetFromLocalStorage = <T extends z.ZodType>(p: {
  key: string;
  schema: T;
}): z.infer<T> | null => {
  const parsedJson = safeJsonParse(window.localStorage.getItem(p.key));
  const validated = p.schema.safeParse(parsedJson.data);
  return validated.success ? validated.data : null;
};

const safeSetToLocalStorage = (p: { key: string; value: unknown }) => {
  window.localStorage.setItem(p.key, JSON.stringify(p.value));
};

const safeGetAccordionSectionIsExpandedFromLocalStorage = (p: {
  key: string;
}) => safeGetFromLocalStorage({ key: p.key, schema: z.boolean() });

export const GovUkAccordionSectionTemplate = (p: {
  title: string;
  children: ReactNode;
  isExpandedController: boolean;
  localStorageKey: string;
}) => {
  const isFirstRenderRef = useRef(true);
  const [isExpanded, setIsExpanded] = useState(
    () =>
      safeGetAccordionSectionIsExpandedFromLocalStorage({
        key: p.localStorageKey
      }) === true
  );

  useEffect(() => {
    safeSetToLocalStorage({ key: p.localStorageKey, value: isExpanded });
  }, [isExpanded]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setIsExpanded(p.isExpandedController);
  }, [p.isExpandedController]);

  return (
    <>
      <div className="govuk-accordion__section">
        <div className="govuk-accordion__section-header">
          <h2 className="govuk-accordion__section-heading">
            <div>
              <button
                type="button"
                aria-controls="accordion-default-content"
                className="govuk-accordion__section-button"
                aria-expanded={isExpanded}
                aria-label={p.title}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <span className="govuk-accordion__section-toggle">
                  <span className="govuk-accordion__section-toggle-focus">
                    <span className="govuk-accordion__section-toggle-text">
                      {p.title}
                    </span>
                    <span className="govuk-accordion-nav__chevron-wrapper">
                      <span
                        className={`govuk-accordion-nav__chevron${!isExpanded ? ' govuk-accordion-nav__chevron--down' : ''}`}
                      />
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </h2>
        </div>
      </div>
      <div hidden={!isExpanded}>
        <div className="govuk-accordion-content-wrapper">{p.children}</div>
      </div>
    </>
  );
};

export const GovUkAccordionTemplate = (p: { children: ReactNode }) => {
  return (
    <div className="govuk-accordion" data-testid="accordion">
      {p.children}
    </div>
  );
};
export const GovUkAccordionOpenCloseLinkTemplate = (p: {
  isExpandedController: boolean;
  onClick: () => void;
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'end' }}>
      <button
        type="button"
        className="govuk-link button-as-link"
        onClick={() => p.onClick()}
        style={{ paddingBottom: '8px' }}
      >
        {p.isExpandedController ? 'Close' : 'Open'} all sections
      </button>
    </div>
  );
};
