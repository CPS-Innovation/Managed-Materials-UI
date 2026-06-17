import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Navigate, useParams } from 'react-router-dom';

import {
  DefinitionList,
  Layout,
  LoadingSpinner,
  NavList,
  type NavListItem,
  type NavListSection,
  SectionBreak,
  TwoCol
} from '../components';

import { PcdReviewCoreType, PcdReviewTypeLabel } from '../constants/enum.ts';
import { useAppRoute, useCaseInfoStore } from '../hooks/';
import { usePCDReviewCore } from '../hooks/pcd-review/usePCDReviewCore.ts';
import { usePCDReviewDetails } from '../hooks/pcd-review/usePCDReviewDetails.ts';
import type {
  PCDReviewCoreResponseType,
  PCDReviewDetailsResponseType
} from '../schemas/pcdReview';

dayjs.extend(customParseFormat);

const PCD_REVIEW_CORE_NAV_TYPE_ORDER: PcdReviewCoreType[] = [
  PcdReviewCoreType.PreChargeDecisionAnalysis,
  PcdReviewCoreType.InitialReview,
  PcdReviewCoreType.EarlyAdvice
];

const CHARGING_DECISION_TABLE_HEADINGS = [
  'Suspect',
  'Charging code',
  'Advice',
  'Evidential Reason Code (if ‘K’)',
  'Public Interest Code (if C, D, D2, D5, E, F or L)'
];

const PUBLIC_INTEREST_REASON_CODES = new Set([
  'C',
  'D',
  'D2',
  'D5',
  'E',
  'F',
  'L'
]);

type AnalysisOutcome =
  PCDReviewDetailsResponseType['preChargeDecisionAnalysisOutcome'];
type DecisionOutcome = PCDReviewDetailsResponseType['preChargeDecisionOutcome'];

const ReviewSidebar = ({ core }: { core: PCDReviewCoreResponseType }) => {
  const { getRoute } = useAppRoute();

  const sections: NavListSection[] = PCD_REVIEW_CORE_NAV_TYPE_ORDER.map(
    (type) => ({
      headerLabel: PcdReviewTypeLabel[type],
      items: core
        .filter((item) => item.type === type)
        .map<NavListItem>((item) => ({
          name: dayjs(item.date, 'DD/MM/YYYY').format('D MMMM YYYY'),
          href: `${getRoute('PCD_REVIEW', false)}/${item.id}`
        }))
    })
  );

  return (
    <>
      <h2 className="govuk-visually-hidden">PCD Review List</h2>
      <NavList sections={sections} />
    </>
  );
};

const ReviewSummary = ({
  analysis,
  decision
}: {
  analysis: AnalysisOutcome;
  decision: DecisionOutcome;
}) => (
  <DefinitionList
    items={[
      { title: 'Review type: ', description: [`${analysis.consultationType}`] },
      { title: 'Prosecutor name: ', description: [decision.decisionMadeBy] },
      {
        title: 'Review date: ',
        description: [`${decision.pcdHistoryActionPlan[0]?.entryDate}`]
      }
    ]}
  />
);

const CaseHeadlineCodeTest = ({ analysis }: { analysis: AnalysisOutcome }) => {
  const items = [
    { header: 'Evidential Assessment', body: analysis.evidentialAssessment },
    {
      header: 'Public Interest Assessment',
      body: analysis.publicInterestAssessment
    },
    { header: 'Allocation', body: analysis.allocation },
    { header: 'ECHR', body: analysis.europeanCourtOfHumanRights },
    {
      header: 'Disclosure Actions and Issues',
      body: analysis.disclosureActionsAndIssues
    },
    { header: 'Trial Strategy', body: analysis.trialStrategy },
    {
      header: 'Witness / Victim Information and Actions',
      body: analysis.witnessOrVictimInformationAndActions
    },
    {
      header: 'Instructions to Op Delivery / Advocate',
      body: analysis.instructionsToOperationsDeliveryOrAdvocate
    }
  ];

  return (
    <>
      <h1 className="govuk-heading-l">Case Headline / Code Test</h1>
      <p className="govuk-body">{analysis.caseSummary}</p>
      {items.map((c) => (
        <div key={c.header}>
          <h3 className="govuk-heading-m">{c.header}</h3>
          <p className="govuk-body">{c.body}</p>
        </div>
      ))}
    </>
  );
};

const ChargingDecisionTable = ({ decision }: { decision: DecisionOutcome }) => {
  const decisions = decision.defendantDecisions.map((d) => {
    const [chargingCode, advice] = d?.decisionDescription?.split('-') ?? [];
    const reason = d?.reason?.split('-')[1]?.trim() ?? [];

    return {
      id: d.id,
      defendantName: d?.defendantName,
      chargingCode: chargingCode?.trim(),
      advice: advice?.trim(),
      reason,
      reasonCode: d?.reasonCode,
      publicInterestCode: d?.publicInterestCode
    };
  });

  return (
    <>
      <h1 className="govuk-heading-l">Charging Decision & Advice</h1>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-visually-hidden">
          Charging Decision & Advice Table
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            {CHARGING_DECISION_TABLE_HEADINGS.map((heading) => (
              <th scope="col" className="govuk-table__header" key={heading}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {decisions.map((d) => (
            <tr className="govuk-table__row" key={d.id}>
              <th scope="col" className="govuk-table__header">
                {d.defendantName}
              </th>
              <td className="govuk-table__cell">{d.chargingCode}</td>
              <td className="govuk-table__cell">{d.advice}</td>
              <td className="govuk-table__cell">
                {d.chargingCode === 'K' ? d.reason : '-'}
              </td>
              <td className="govuk-table__cell">
                {PUBLIC_INTEREST_REASON_CODES.has(d.reasonCode)
                  ? d.publicInterestCode
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const FurtherActionDetails = ({ decision }: { decision: DecisionOutcome }) => {
  const plan = decision.pcdHistoryActionPlan[0];
  const firstDefendant = decision.defendantDecisions[0];

  return (
    <>
      <h1 className="govuk-heading-l">
        Further action agreed for codes A, B, B2, H, I, J
      </h1>
      <DefinitionList
        items={[
          { title: 'Action type:', description: [`${plan?.actionType}`] },
          { title: 'Action date:', description: [`${plan?.actionDate}`] },
          { title: '', description: [`${plan?.actionPoint}`] },
          {
            title: 'Return bail date:',
            description: [`${firstDefendant?.returnBailDate}`]
          },
          {
            title: 'Investigation stage at which advice sought:',
            description: [decision.investigationStage]
          },
          {
            title: 'How advice delivered:',
            description: [`${decision.method}`]
          }
        ]}
      />
    </>
  );
};

export const PcdReviewPage = () => {
  const { reviewHistoryId: reviewHistoryIdParam } = useParams<{
    reviewHistoryId?: string;
  }>();
  const { caseInfo } = useCaseInfoStore();

  const { data: pcdReviewCoreData, isLoading: pcdReviewCoreLoading } =
    usePCDReviewCore();

  const reviewHistoryId = Number(reviewHistoryIdParam);
  const firstPcdReviewCoreHistoryId = pcdReviewCoreData?.[0]?.id;
  const resolvedReviewHistoryId = Number.isFinite(reviewHistoryId)
    ? reviewHistoryId
    : firstPcdReviewCoreHistoryId;
  const shouldRedirectToFirstReview =
    !reviewHistoryIdParam &&
    !pcdReviewCoreLoading &&
    firstPcdReviewCoreHistoryId !== undefined;

  const { isLoading: pcdReviewDetailsLoading, data: pcdReviewDetailsData } =
    usePCDReviewDetails(resolvedReviewHistoryId);

  const isLoadingPage = !caseInfo || pcdReviewCoreLoading;
  const noReviewCompleted =
    !pcdReviewCoreLoading &&
    Array.isArray(pcdReviewCoreData) &&
    pcdReviewCoreData.length === 0;

  const noReviewContent = (
    <div className="govuk-main-wrapper">
      <p className="govuk-body">
        A Review has not yet been completed for this case.
      </p>
    </div>
  );

  const renderMainContent = () => {
    if (pcdReviewDetailsLoading) {
      return <LoadingSpinner isLoading textContent="Loading review" />;
    }

    const analysis = pcdReviewDetailsData?.preChargeDecisionAnalysisOutcome;
    const decision = pcdReviewDetailsData?.preChargeDecisionOutcome;

    if (!analysis || !decision) {
      return (
        <p className="govuk-body">
          Details could not be loaded for this review.
        </p>
      );
    }

    return (
      <>
        <h1 className="govuk-heading-l">Reviews</h1>
        <ReviewSummary analysis={analysis} decision={decision} />
        <SectionBreak size="xl" />

        <CaseHeadlineCodeTest analysis={analysis} />
        <SectionBreak size="xl" />

        <ChargingDecisionTable decision={decision} />
        <SectionBreak size="xl" />

        <FurtherActionDetails decision={decision} />
        <SectionBreak size="xl" />
      </>
    );
  };

  const renderBody = () => {
    if (shouldRedirectToFirstReview) {
      return <Navigate to={`${firstPcdReviewCoreHistoryId}`} replace />;
    }

    if (isLoadingPage) {
      return null;
    }

    if (noReviewCompleted) {
      return noReviewContent;
    }

    return (
      <div className="govuk-main-wrapper" style={{ whiteSpace: 'pre-wrap' }}>
        <TwoCol sidebar={<ReviewSidebar core={pcdReviewCoreData ?? []} />}>
          {renderMainContent()}
        </TwoCol>
      </div>
    );
  };

  return (
    <Layout title="Reviews">
      <LoadingSpinner isLoading={isLoadingPage} />
      {renderBody()}
    </Layout>
  );
};
