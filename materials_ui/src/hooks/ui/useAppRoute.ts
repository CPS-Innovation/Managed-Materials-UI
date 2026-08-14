import { useMatch } from 'react-router-dom';

export const APP_ROUTES = {
  ROOT: '/',
  COMMUNICATIONS: 'communications',
  DISCARD: 'discard-material',
  MATERIALS: 'materials',
  NOT_FOUND: 'not-found',
  PCD_REQUEST: 'pcd-request',
  PCD_REVIEW: 'pcd-review',
  RECLASSIFICATION: 'reclassify',
  RECLASSIFY_TO_UNUSED: 'reclassify-to-unused',
  REVIEW_REDACT: 'review-and-redact',
  VIEW_DOCUMENT: 'view-document',
  SERVER_ERROR: 'service-down',
  UNAUTHORISED: 'unauthorized',
  CASE_SEARCH: 'case-search',
  UPDATE_MATERIAL: 'update-material',
} as const;

type AppRouteKey = keyof typeof APP_ROUTES;

export const useAppRoute = () => {
  const match = useMatch('/:urn/:caseId/*');
  const urn = match?.params.urn;
  const initCaseId = match?.params.caseId;
  const parsedCaseId = Number(initCaseId);
  const caseId = isNaN(parsedCaseId) ? undefined : parsedCaseId;

  // removes everything after the first non-alphanumeric character
  const urnPrefix = urn?.match(/^[a-zA-Z0-9]+/)?.[0];

  const getRoute = (routeName: AppRouteKey, prefix: boolean = true) => {
    const routePrefix = urn && caseId && prefix ? `/${urn}/${caseId}/` : '';

    return `${routePrefix}${APP_ROUTES[routeName]}`;
  };

  return { getRoute, urn, caseId, urnPrefix };
};
