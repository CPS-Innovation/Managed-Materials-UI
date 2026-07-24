import { useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  DefinitionList,
  ErrorSummary,
  Layout,
  LoadingSpinner,
  SectionBreak,
  StatusTag,
} from '../components';
import { FilterContext, FiltersContext } from '../context/FiltersContext';
import { useCaseInfoStore } from '../hooks';
import { useCaseDetails } from '../hooks/search/useCaseSearch';
import { formatDateLong } from '../utils/date';

type IFormInput = { urn: string };

const MAX_URN_LENGTH = 11;

export const CaseSearchPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<IFormInput>();
  const { clearCaseInfo } = useCaseInfoStore();
  const [queryUrn, setQueryUrn] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { resetAllFilters } = useContext<FiltersContext>(FilterContext);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const urn = (data.urn?.trim() ?? '').slice(0, MAX_URN_LENGTH);
    setQueryUrn(urn);
    setHasSearched(true);
  };

  const caseDetails = useCaseDetails({ urn: queryUrn });

  useEffect(() => {
    clearCaseInfo();
    resetAllFilters();
  }, []);

  return (
    <Layout plain title="Case Search">
      <div className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
        <div className="govuk-grid-row govuk-grid-row--case-search">
          <div className="govuk-grid-column-two-thirds">
            {errors.urn && errors.urn.type === 'required' && (
              <ErrorSummary
                errorTitle="There is a problem"
                errorMessage={errors.urn.message || ''}
              />
            )}

            <h1 className="govuk-heading-l govuk-!-margin-bottom-0">Find a case</h1>
            <p className="govuk-body govuk-hint govuk-!-margin-bottom-9">
              Search and review a CPS case in England and Wales
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={`govuk-form-group${errors.urn ? ' govuk-form-group--error' : ''}`}>
                <h1 className="govuk-label-wrapper">
                  <label className="govuk-label govuk-label--s" htmlFor="case-urn">
                    Search for a case URN
                  </label>
                </h1>

                {errors.urn && (
                  <p id="case-urn-error" className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error:</span> {errors.urn.message}
                  </p>
                )}

                <input
                  className={`govuk-input govuk-input--width-10 ${errors.urn ? 'govuk-input--error' : ''}`}
                  id="case-urn"
                  type="text"
                  {...register('urn', { required: 'URN is required' })}
                />
              </div>

              <div className="govuk-button-group">
                <button className="govuk-button" data-module="govuk-button" type="submit">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        <LoadingSpinner isLoading={caseDetails.isLoading} textContent="Searching for a case..." />
        {(() => {
          if (caseDetails.isLoading) return null;

          const caseDetailsData = caseDetails.data?.data;
          if (!hasSearched) return <></>;

          if (caseDetails.error?.status === 403)
            return (
              <div className="govuk-body">
                <div className="govuk-heading-m">You do not have access to this case</div>
                <p>This case is assigned to a unit you do not have access to.</p>
                <a className="govuk-link" onClick={() => setFocus('urn')}>
                  Search for another case
                </a>
              </div>
            );
          if (caseDetails.error?.status === 500)
            return (
              <div className="govuk-body">
                <div className="govuk-heading-m">Something went wrong</div>
                <a className="govuk-link" onClick={() => setFocus('urn')}>
                  Search for another case
                </a>
              </div>
            );

          if (caseDetailsData === undefined || caseDetailsData.length === 0)
            return (
              <p className="govuk-body">
                We've found <b>0</b> case that matches <b>{queryUrn}</b>
              </p>
            );

          return (
            <div className="govuk-grid-row govuk-grid-row--case-search">
              <div className="govuk-grid-column-two-thirds">
                <p className="govuk-body">
                  We've found <b>{caseDetailsData.length}</b> case that matches <b>{queryUrn}</b>
                </p>

                {caseDetailsData.map((caseItem) => {
                  const lead = caseItem.leadDefendantDetails;

                  const defendantFullName = lead
                    ? `${lead.surname}, ${lead.firstNames}${
                        (caseItem.defendants?.length ?? 0) > 1 ? ' and others' : ''
                      }`
                    : '';

                  const dateOfBirth = lead ? `Date of birth: ${formatDateLong(lead.dob)}` : '';

                  const nextHearingDate = formatDateLong(caseItem.headlineCharge?.nextHearingDate);

                  const dateOfOffence = formatDateLong(caseItem.headlineCharge?.date);

                  return (
                    <div key={caseItem.id}>
                      <SectionBreak />
                      <div>
                        <h2>
                          <Link
                            className="govuk-link govuk-!-margin-bottom-0"
                            to={`/${queryUrn}/${caseItem.id}/materials`}
                          >
                            {caseItem.uniqueReferenceNumber}
                          </Link>
                        </h2>
                        {caseDetails && (
                          <>
                            <p className="govuk-hint govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                              {defendantFullName}
                            </p>
                            <p className="govuk-hint govuk-!-margin-top-0 govuk-!-margin-bottom-0">
                              {dateOfBirth}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="govuk-!-margin-top-4">
                        {caseItem.isCaseCharged ? (
                          <>
                            <DefinitionList
                              fixedWidth
                              items={[
                                {
                                  title: 'Status: ',
                                  description: [<StatusTag status="Charged" />],
                                },
                                { title: 'Court hearing: ', description: [`${nextHearingDate}`] },
                                { title: 'Date of offence: ', description: [`${dateOfOffence}`] },
                                {
                                  title: 'Charges: ',
                                  description: [
                                    `${caseItem.defendants[0]?.charges[0]?.shortDescription}`,
                                  ],
                                },
                              ]}
                            />
                          </>
                        ) : (
                          <DefinitionList
                            fixedWidth
                            items={[
                              {
                                title: 'Status: ',
                                description: [<StatusTag status="Not yet charged" />],
                              },
                              {
                                title: 'Proposed: ',
                                description: [
                                  !caseItem.defendants[0]?.proposedCharges.length && 'N/A',
                                ],
                              },
                            ]}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </Layout>
  );
};
