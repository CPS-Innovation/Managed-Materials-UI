import { useParams } from 'react-router-dom';

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
  TWO_TABS: 'two-tabs',
  UPDATE_MATERIAL: 'update-material',
} as const;

type AppRouteKey = keyof typeof APP_ROUTES;

export const getRoute = (p: { routeName: AppRouteKey; prefix?: string }) => {
  const routePrefix = p.prefix ? `/${p.prefix}/` : '';

  return `${routePrefix}${APP_ROUTES[p.routeName]}`;
};

export const useAppRoute = () => {
  const params = useParams();
  const caseId = params.caseId;

  const getRouteMethod = (routeName: AppRouteKey, prefix: boolean = true) =>
    getRoute({ routeName, prefix: prefix && caseId ? `/${caseId}` : '' });

  return { getRoute: getRouteMethod, caseId };
};
