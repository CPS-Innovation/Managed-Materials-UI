import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isPathCurrentUrl } from '../../utils/url';
import './Tabs.scss';

export type Tab = {
  id: string;
  name: string;
  href: string;
  active?: boolean;
  shouldBlockNavigationCheck?: (tab: Tab) => boolean;
};

type Props = { tabs: Tab[] };

export const Tabs = ({ tabs }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const selectedTabIndex = tabs.findIndex(
    (tab) => tab.active || isPathCurrentUrl(pathname, tab.href),
  );
  const activeTabIndex = selectedTabIndex === -1 ? 0 : selectedTabIndex;
  const [focusedTabIndex, setFocusedTabIndex] = useState(activeTabIndex);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const shouldRestoreTabFocus = Boolean(
    (location.state as { focusTab?: boolean } | null)?.focusTab,
  );

  useEffect(() => {
    setFocusedTabIndex(activeTabIndex);

    if (shouldRestoreTabFocus) {
      tabRefs.current[activeTabIndex]?.focus();
    }
  }, [activeTabIndex, shouldRestoreTabFocus]);

  if (tabs.length <= 1) {
    return null;
  }

  const handleTabClick = (event: MouseEvent, tab: Tab) => {
    event.preventDefault();

    navigate(tab.href, { state: { focusTab: true } });
  };

  const handleKeyboardPress = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;

    setFocusedTabIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <h2 className="govuk-tabs__title">Contents</h2>
      <div className="govuk-tabs__list" role="tablist">
        {tabs.map((tab: Tab, index: number) => {
          const { shouldBlockNavigationCheck = () => false } = tab;
          const isActiveAndCurrent = index === activeTabIndex;

          return (
            <button
              key={index}
              aria-selected={isActiveAndCurrent}
              className={
                isActiveAndCurrent
                  ? `govuk-tabs__list-item govuk-tabs__list-item--selected`
                  : `govuk-tabs__list-item`
              }
              onClick={(event) => {
                const blockNavResponse = shouldBlockNavigationCheck(tab);
                if (blockNavResponse === true) return;
                handleTabClick(event, tab);
              }}
              onKeyDown={(event) => {
                handleKeyboardPress(event, index);
              }}
              onFocus={() => setFocusedTabIndex(index)}
              role="tab"
              id={`tab-${index}`}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              tabIndex={index === focusedTabIndex ? 0 : -1}
            >
              <span className="govuk-tabs__tab">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
