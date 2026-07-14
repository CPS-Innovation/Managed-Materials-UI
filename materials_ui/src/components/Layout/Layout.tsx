import { PropsWithChildren, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Banner, CaseInfo, LoadingSpinner, Tabs } from '..';
import { useAppRoute, useBanner } from '../../hooks';
import type { Tab } from '../Tabs/Tabs';

import { useCaseInfoStore } from '../../stores';

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
  const { banners } = useBanner();
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
        <div>{banners && banners.map((banner, index) => <Banner key={index} {...banner} />)}</div>

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
