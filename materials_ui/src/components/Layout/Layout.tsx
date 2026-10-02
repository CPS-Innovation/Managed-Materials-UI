import { PropsWithChildren, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { CaseInfo, LoadingSpinner, Tabs } from '..';
import { useAppRoute } from '../../hooks';
import type { Tab } from '../Tabs/Tabs';

import { useCaseInfoStore } from '../../stores';

import { useAxiosInstance } from '../../caseWorkApp/components/utils/getData';
import { useCaseInfoFromAxiosInstance } from '../../hooks/case/useCaseInfo';
import { getRouteWithUrnPrefix } from '../../hooks/ui/useAppRoute';
import { GovUkBanner } from '../../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import { CaseInfoType } from '../../schemas';
import './Layout.scss';

type Props = {
  plain?: boolean;
  title?: string;
  shouldBlockNavigationCheck?: (tab: Tab) => boolean;
};

export const Layout = ({
  children,
  plain = false,
  title,
  shouldBlockNavigationCheck,
}: PropsWithChildren<Props>) => {
  const { caseInfo, isLoading: caseInfoLoading } = useCaseInfoStore();
  const location = useLocation();
  const { getRoute } = useAppRoute();

  const initTabs: Tab[] = [
    {
      id: 'pcd-request',
      name: 'PCD Request',
      href: getRoute('PCD_REQUEST'),
      active: location.pathname === '/' || location.pathname.includes(getRoute('PCD_REQUEST')),
    },
    {
      id: 'materials',
      name: 'Materials',
      href: getRoute('MATERIALS'),
      active: location.pathname === getRoute('MATERIALS'),
    },
    {
      id: 'review-redact',
      name: 'Review and Redact',
      href: getRoute('REVIEW_REDACT'),
      active: location.pathname === getRoute('REVIEW_REDACT'),
    },
    {
      id: 'communications',
      name: 'Communications',
      href: getRoute('COMMUNICATIONS'),
      active: location.pathname === getRoute('COMMUNICATIONS'),
    },
    {
      id: 'pcd-review',
      name: 'Reviews',
      href: getRoute('PCD_REVIEW'),
      active: location.pathname === '/' || location.pathname.includes(getRoute('PCD_REVIEW')),
    },
  ];

  const tabs = initTabs.map((tab) => ({ ...tab, shouldBlockNavigationCheck }));

  useEffect(() => {
    if (title) {
      document.title = title + ' - Manage Materials and Communications';
    }
  }, [location, title]);

  return (
    <>
      <main className="main-container">
        {!plain ? (
          <>
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
          </>
        ) : (
          children
        )}
      </main>
    </>
  );
};

const getPcdRequestPageRoute = (p: { urn: string; caseId: number | string }) => {
  return getRouteWithUrnPrefix({ urn: p.urn, caseId: p.caseId, routeName: 'PCD_REQUEST' });
};
const getMaterialsPageRoute = (p: { urn: string; caseId: number | string }) => {
  return getRouteWithUrnPrefix({ urn: p.urn, caseId: p.caseId, routeName: 'MATERIALS' });
};
const getReviewRedactPageRoute = (p: { urn: string; caseId: number | string }) => {
  return getRouteWithUrnPrefix({ urn: p.urn, caseId: p.caseId, routeName: 'REVIEW_REDACT' });
};
const getCommunicationsPageRoute = (p: { urn: string; caseId: number | string }) => {
  return getRouteWithUrnPrefix({ urn: p.urn, caseId: p.caseId, routeName: 'COMMUNICATIONS' });
};
const getPcdReviewPageRoute = (p: { urn: string; caseId: number | string }) => {
  return getRouteWithUrnPrefix({ urn: p.urn, caseId: p.caseId, routeName: 'PCD_REVIEW' });
};

const createTabs = (p: { urn: string; caseId: number | string; currentPath: string }) => [
  (() => {
    const route = getPcdRequestPageRoute({ urn: p.urn, caseId: p.caseId });
    return { id: 'pcd-request', name: 'PCD Request', href: route, active: p.currentPath === route };
  })(),
  (() => {
    const route = getMaterialsPageRoute({ urn: p.urn, caseId: p.caseId });
    return { id: 'materials', name: 'Materials', href: route, active: p.currentPath === route };
  })(),
  (() => {
    const route = getReviewRedactPageRoute({ urn: p.urn, caseId: p.caseId });
    return {
      id: 'review-redact',
      name: 'Review and Redact',
      href: route,
      active: p.currentPath === route,
    };
  })(),
  (() => {
    const route = getCommunicationsPageRoute({ urn: p.urn, caseId: p.caseId });
    return {
      id: 'communications',
      name: 'Communications',
      href: route,
      active: p.currentPath === route,
    };
  })(),
  (() => {
    const route = getPcdReviewPageRoute({ urn: p.urn, caseId: p.caseId });
    return { id: 'pcd-review', name: 'Reviews', href: route, active: p.currentPath === route };
  })(),
];

export const Layout2 = (p: {
  children: React.ReactNode;
  isLoading: boolean;
  title?: string;
  caseId: number | string;
  shouldBlockNavigationCheck?: (tab: Tab) => boolean;
}) => {
  const axiosInstance = useAxiosInstance();
  const { data: caseInfo } = useCaseInfoFromAxiosInstance({ axiosInstance, caseId: p.caseId });
  const isLoading = p.isLoading || caseInfo === undefined;

  const location = useLocation();

  useEffect(() => {
    if (p.title) {
      document.title = p.title + ' - Manage Materials and Communications';
    }
  }, [location, p.title]);

  return (
    <>
      <main className="main-container">
        <LoadingSpinner isLoading={isLoading} textContent="Loading case" />
        {!p.isLoading && caseInfo && <Layout2Template caseInfo={caseInfo} children={p.children} />}
        {!p.isLoading && !caseInfo && (
          <GovUkBanner
            variant="error"
            headerTitle="Error"
            contentHeading="Error"
            contentBody="Unable to load case information"
          />
        )}
      </main>
    </>
  );
};

const Layout2Template = (p: {
  caseInfo: CaseInfoType;
  children: React.ReactNode;
  shouldBlockNavigationCheck?: (tab: Tab) => boolean;
}) => {
  const tabsData = createTabs({
    urn: p.caseInfo.urn,
    caseId: p.caseInfo.id,
    currentPath: location.pathname,
  }).map((tab) => ({ ...tab, shouldBlockNavigationCheck: p.shouldBlockNavigationCheck }));

  return (
    <>
      <CaseInfo caseInfo={p.caseInfo} />
      <Tabs tabs={tabsData} />
      <div id="main-content">
        <Outlet />
        {p.children}
      </div>
    </>
  );
};
