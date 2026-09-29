import { useParams } from 'react-router-dom';
import { TwoTabsPageContent } from '../modules/twoTabs/TwoTabsPageContent';

const useTwoTabsRoute = () => {
  const { urn, caseId: caseIdStr } = useParams();
  const caseId = caseIdStr ? +caseIdStr : 0;

  return { urn: urn!, caseId };
};

export const TwoTabsPage = () => {
  const { urn, caseId } = useTwoTabsRoute();

  return <TwoTabsPageContent urn={urn} caseId={caseId} />;
};
