import { useParams } from 'react-router-dom';
import { TwoTabsPageContent } from '../modules/twoTabs/TwoTabsPageContent';

const useTwoTabsRoute = () => {
  const { caseId: caseIdStr } = useParams();
  const caseId = caseIdStr ? +caseIdStr : 0;

  return { caseId };
};

export const TwoTabsPage = () => {
  const { caseId } = useTwoTabsRoute();

  return <TwoTabsPageContent caseId={caseId} />;
};
