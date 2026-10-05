import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { CaseInfo, LoadingSpinner, Tabs } from '..';
import type { Tab } from '../Tabs/Tabs';

import { useCaseInfo } from '../../hooks';
import { APP_ROUTES } from '../../hooks/ui/useAppRoute';
import './Layout.scss';

const getRoute = (p: {
  caseId: number | string;
  routeName: keyof typeof APP_ROUTES;
  prefix: boolean;
}) => {
  const { caseId, routeName, prefix } = p;
  const routePrefix = caseId && prefix ? `/${caseId}/` : '';

  return `${routePrefix}${APP_ROUTES[routeName]}`;
};

export const PlainLayout = (p: { children: React.ReactNode; title?: string }) => {
  useEffect(() => {
    if (p.title) document.title = p.title + ' - Manage Materials and Communications';
  }, [p.title]);

  return <main className="main-container">{p.children}</main>;
};

const createTabs = (p: { caseId: number | string; currentPath: string }): Tab[] => {
  const { caseId, currentPath } = p;

  return [
    (() => {
      const route = getRoute({ caseId, routeName: 'PCD_REQUEST', prefix: true });
      return { id: 'pcd-request', name: 'PCD Request', href: route, active: currentPath === route };
    })(),
    (() => {
      const route = getRoute({ caseId, routeName: 'MATERIALS', prefix: true });
      return { id: 'materials', name: 'Materials', href: route, active: currentPath === route };
    })(),
    (() => {
      const route = getRoute({ caseId, routeName: 'REVIEW_REDACT', prefix: true });
      return {
        id: 'review-redact',
        name: 'Review and Redact',
        href: route,
        active: currentPath === route,
      };
    })(),
    (() => {
      const route = getRoute({ caseId, routeName: 'COMMUNICATIONS', prefix: true });
      return {
        id: 'communications',
        name: 'Communications',
        href: route,
        active: currentPath === route,
      };
    })(),
    (() => {
      const route = getRoute({ caseId, routeName: 'PCD_REVIEW', prefix: true });
      return { id: 'pcd-review', name: 'Reviews', href: route, active: currentPath === route };
    })(),
  ];
};

export const Layout = (p: {
  children: React.ReactNode;
  caseId: number | string;
  title?: string;
  shouldBlockNavigationCheck?: (tab: Tab) => boolean;
}) => {
  const { children, title, caseId, shouldBlockNavigationCheck } = p;

  const location = useLocation();

  const { caseInfo, loading: caseInfoLoading } = useCaseInfo({ caseId });

  const tabs = createTabs({ caseId, currentPath: location.pathname }).map((tab) => ({
    ...tab,
    shouldBlockNavigationCheck,
  }));

  return (
    <PlainLayout title={title}>
      <LoadingSpinner isLoading={caseInfoLoading || !caseInfo} textContent="Loading case" />
      {!caseInfoLoading && caseInfo && (
        <>
          <CaseInfo caseInfo={caseInfo} />
          <Tabs tabs={tabs} />
          <div id="main-content">
            <Outlet />
            {children}
          </div>
        </>
      )}
    </PlainLayout>
  );
};
