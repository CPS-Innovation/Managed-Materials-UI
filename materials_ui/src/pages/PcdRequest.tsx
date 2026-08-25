import DOMPurify from 'dompurify';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Accordion,
  DefinitionList,
  Layout,
  LoadingSpinner,
  SectionBreak,
  TwoCol,
} from '../components';
import { useAppRoute, useGetPcdRequest, usePcdRequestListings } from '../hooks';
import { TPcdRequestListings } from '../schemas/pcd';
import { formatDate } from '../utils/date';
import { cleanString } from '../utils/string';
import { NotAuthorisedPage } from './NotAuthorisedPage';

const ShowPcdRequest = (p: {
  urn: string;
  caseId: number;
  pcdId: number;
  isFirstPcdRequest: boolean;
}) => {
  const { data: pcdRequest } = useGetPcdRequest({ urn: p.urn, caseId: p.caseId, pcdId: p.pcdId });

  return (
    <>
      <LoadingSpinner isLoading={pcdRequest === undefined} />

      {pcdRequest === null && <>Unable to retriieve the pcd request with ID: {p.pcdId}</>}
      {pcdRequest && (
        <>
          <h1 className="govuk-heading-l" tabIndex={-1} ref={(el) => el?.focus()}>
            {p.isFirstPcdRequest ? 'Latest PCD request' : formatDate(pcdRequest?.decisionRequested)}
          </h1>
          <DefinitionList
            items={[
              {
                title: 'Decision required by:',
                description: [formatDate(pcdRequest?.decisionRequiredBy)],
              },
              {
                title: 'Decision requested:',
                description: [formatDate(pcdRequest?.decisionRequested)],
              },
            ]}
          />

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Police details</h2>
          <div className="table-container">
            <table className="govuk-table govuk-table--width-fluid gov-table--pcd">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Role
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Name
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Number
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {pcdRequest?.policeContactDetails?.map(({ name, number, role }, index) => (
                  <tr className="govuk-table__row" key={index}>
                    <th scope="row" className="govuk-table__header">
                      {role}
                    </th>
                    <td className="govuk-table__cell">{name}</td>
                    <td className="govuk-table__cell">{number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Case outline</h2>
          {pcdRequest?.caseOutline.map(({ heading, textWithCmsMarkup }, index) => (
            <Fragment key={index}>
              <h3 className="govuk-heading-m">{heading}</h3>
              <p
                className="govuk-body"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(cleanString(textWithCmsMarkup)),
                }}
              />
            </Fragment>
          ))}

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Supervising officer's comments</h2>
          <p className="govuk-body">{pcdRequest?.comments?.text || 'None'}</p>

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Proposed charges</h2>

          <div className="table-container">
            <table className="govuk-table gov-table--pcd">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header govuk-table__cell--md">
                    Name
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__cell--sm">
                    Date of birth
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Category
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Proposed charge
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__cell--sm">
                    Location
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__cell--sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {pcdRequest.suspects.map((suspect, i) => {
                  const rowSpan =
                    suspect.proposedCharges.length > 1 ? suspect.proposedCharges.length : 1;

                  return suspect.proposedCharges.map((charge, chargeIndex) => (
                    <tr className="govuk-table__row" key={i}>
                      {chargeIndex === 0 && (
                        <>
                          <th scope="row" className="govuk-table__cell" rowSpan={rowSpan}>
                            {formatFullName(suspect.surname, suspect.firstNames)}
                          </th>
                          <td className="govuk-table__cell" rowSpan={rowSpan}>
                            {suspect.dob ? formatDate(suspect.dob) : ''}
                          </td>
                        </>
                      )}
                      <td className="govuk-table__cell">{charge.category}</td>
                      <td className="govuk-table__cell">{charge.charge}</td>
                      <td className="govuk-table__cell">{charge.location}</td>
                      <td className="govuk-table__cell">{formatDate(charge.earlyDate)}</td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Bail details</h2>

          <div className="table-container">
            <table className="govuk-table gov-table--pcd">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header govuk-table__cell--md">
                    Name
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__cell--sm">
                    Bail date
                  </th>
                  <th scope="col" className="govuk-table__header govuk-table__cell--md">
                    Remand status
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Bail conditions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {pcdRequest?.suspects.map((suspect, index) => (
                  <tr className="govuk-table__row" key={index}>
                    <th scope="row" className="govuk-table__cell">
                      {formatFullName(suspect.surname, suspect.firstNames)}
                    </th>
                    <td className="govuk-table__cell">
                      {suspect.bailDate ? formatDate(suspect.bailDate) : ''}
                    </td>
                    <td className="govuk-table__cell">{suspect.remandStatus}</td>
                    <td className="govuk-table__cell">{suspect.bailConditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionBreak size="xl" />

          <h2 className="govuk-heading-l">Materials provided</h2>
          {pcdRequest.materialProvided.length ? (
            <Accordion
              plain
              items={[
                {
                  title: {
                    expanded: 'Hide all materials provided',
                    collapsed: 'Show all materials provided',
                  },
                  content: (
                    <div className="table-container">
                      <table className="govuk-table govuk-table--width-fluid gov-table--pcd">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">
                              Material name
                            </th>
                            <th scope="col" className="govuk-table__header">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {pcdRequest.materialProvided.map(({ subject, date }, index) => (
                            <tr className="govuk-table__row" key={index}>
                              <td className="govuk-table__header">{subject}</td>
                              <td className="govuk-table__cell">{date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ),
                },
              ]}
            />
          ) : (
            <p className="govuk-body">No materials to show.</p>
          )}
        </>
      )}
    </>
  );
};

const usePcdRequestPageAppRoute = () => {
  const { caseId, urn } = useAppRoute();
  return { caseId: caseId!, urn: urn! };
};

const ShowPcdRequestSidebarListings = (p: {
  firstPcdId?: number;
  selectPcdRequestId: (x: number) => void;
  selectedPcdRequestId: number | undefined;
  pcdRequestListings: TPcdRequestListings;
}) => {
  return (
    <div>
      <ul className="moj-side-navigation__list">
        {p.pcdRequestListings.map((pcdRequestListing, i) => {
          const isSelected = p.selectedPcdRequestId === pcdRequestListing.id;
          return (
            <li
              key={pcdRequestListing.id}
              className={`moj-side-navigation__item${isSelected ? ' moj-side-navigation__item--active' : ''}`}
            >
              <Link to="#" onClick={() => p.selectPcdRequestId(pcdRequestListing.id + 3)}>
                {i === 0 ? 'Latest PCD request' : formatDate(pcdRequestListing.decisionRequested)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const PcdRequestPage = () => {
  const { urn, caseId } = usePcdRequestPageAppRoute();
  const { data: pcdRequestList } = usePcdRequestListings({ urn, caseId });
  const firstPcdId = pcdRequestList?.[0]?.id;
  const [selectedPcdId, setSelectedPcdId] = useState<number | undefined>(undefined);

  if (pcdRequestList === null) return <NotAuthorisedPage />;

  const actualPcdId = selectedPcdId ?? firstPcdId;
  return (
    <Layout title="PCD Request">
      <pre>{JSON.stringify({ selectedPcdId }, null, 2)}</pre>
      <div className="govuk-main-wrapper" style={{ whiteSpace: 'pre-wrap' }}>
        <LoadingSpinner isLoading={pcdRequestList === undefined} />

        {pcdRequestList && pcdRequestList.length === 0 && (
          <p className="govuk-body" tabIndex={-1} ref={(el) => el?.focus()}>
            There are no PCD Requests to show.
          </p>
        )}

        {pcdRequestList && pcdRequestList.length > 0 && (
          <TwoCol
            sidebar={
              <>
                <h2 className="govuk-visually-hidden">PCD Request List</h2>
                <ShowPcdRequestSidebarListings
                  firstPcdId={firstPcdId}
                  selectPcdRequestId={(x) => setSelectedPcdId(x)}
                  selectedPcdRequestId={actualPcdId}
                  pcdRequestListings={pcdRequestList}
                />
              </>
            }
          >
            {actualPcdId && (
              <ShowPcdRequest
                urn={urn}
                caseId={caseId}
                pcdId={actualPcdId}
                isFirstPcdRequest={firstPcdId === actualPcdId}
              />
            )}
          </TwoCol>
        )}
      </div>
    </Layout>
  );
};

const formatFullName = (surname: string, firstNames?: string | null): string => {
  if (firstNames) return `${surname} ${firstNames}`;

  return surname;
};
