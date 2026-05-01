import { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AutoReclassifyButton } from '..';
import { useAppRoute } from '../../hooks';
import { CaseInfoType } from '../../schemas';

import './CaseInfo.scss';

type Props = { caseInfo: CaseInfoType | null };

export const CaseInfo = ({ caseInfo }: Props) => {
  const { getRoute } = useAppRoute();
  const navigate = useNavigate();

  if (!caseInfo) {
    return null;
  }

  const handleCaseDefendantsLinkClick = (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();

    navigate(getRoute('REVIEW_REDACT'), { state: { docType: 'DAC' } });
  };

  const surname = caseInfo?.leadDefendantSurname?.toString()?.toUpperCase();
  const firstNames = caseInfo?.leadDefendantFirstNames
    ? `, ${caseInfo?.leadDefendantFirstNames}`
    : '';
  const plusNumber =
    caseInfo?.numberOfDefendants > 1
      ? ` +${caseInfo?.numberOfDefendants - 1}`
      : '';

  const caseInfoName = `${surname}${firstNames}${plusNumber}`;

  return (
    <>
      <div className="caseInfo">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <Link to={'/case-search'} className="govuk-back-link">
              Find a case
            </Link>
          </div>

          <div className="govuk-grid-row">
            <div className="caseInfo__container govuk-grid-column-full">
              <div className="caseInfo__info">
                <h2 className="govuk-heading-m case-info-name">
                  {caseInfoName}
                </h2>
                <p className="govuk-body caseInfo__urn">{caseInfo?.urn}</p>
                {caseInfo.numberOfDefendants > 1 && (
                  <p style={{ marginTop: 0 }}>
                    <a href="#" onClick={handleCaseDefendantsLinkClick}>
                      View {caseInfo.numberOfDefendants} defendants and charges
                    </a>
                  </p>
                )}
              </div>
              <div className="caseInfo__actions">
                <AutoReclassifyButton />

                <a
                  href={`${import.meta.env.VITE_CASE_REVIEW_REDIRECT_URL}?CMSCaseId=${caseInfo.id}`}
                  target="_blank"
                  role="button"
                  className="govuk-button"
                  data-module="govuk-button"
                  draggable="false"
                >
                  Case review
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
