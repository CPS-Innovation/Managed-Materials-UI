import { useEffect, useMemo, useRef } from 'react';
import { DownArrowIcon } from '../../assetsCWA/svgs/DownArrowIcon';
import CloseIcon from '../../assetsCWA/svgs/closeIconBold.svg?react';
import { Button } from '../button';
import { DropdownButton } from '../dropDownButton/DropdownButton';
import classes from './Tabs.module.scss';

export type TabButtonProps = {
  items: { id: string; label: string; ariaLabel: string }[];
  activeTabIndex: number;
  handleTabSelection: (documentId: string) => void;
  handleCloseTab: (v?: string) => void;
};

const TabButtons: React.FC<TabButtonProps> = ({
  items,
  activeTabIndex,
  handleTabSelection,
  handleCloseTab
}) => {
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeTabRef.current?.focus();
    activeTabRef.current?.parentElement?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    });
  }, [activeTabIndex, items.length]);

  type ArrowKeyCodes = 'ArrowLeft' | 'ArrowRight';

  const ARROW_KEY_SHIFTS: Record<ArrowKeyCodes, number> = {
    ArrowLeft: -1,
    ArrowRight: 1
  };

  const handleKeyPressOnTab: React.KeyboardEventHandler<HTMLButtonElement> = (
    ev
  ) => {
    if (ev.code in ARROW_KEY_SHIFTS) {
      const thisShift = ARROW_KEY_SHIFTS[ev.code as ArrowKeyCodes]; // -1, 1, or undefined
      moveToNextOrPreviousTab(thisShift);
      if (ev.code === 'ArrowRight' || ev.code === 'ArrowLeft') {
        ev.preventDefault();
      }
    }
    if (ev.code === 'ArrowDown') {
      ev.preventDefault();
      document.getElementById('tabs-dropdown')?.click();
      setTimeout(() => {
        const firstItem = document.querySelector<HTMLElement>(
          '#dropdown-panel button:not(:disabled)'
        );
        firstItem?.focus();
      }, 0);
    }
  };

  const moveToNextOrPreviousTab = (thisShift: number) => {
    const shouldNavigate =
      // must be a left or right key press command
      !!thisShift &&
      // can't go left on the first tab
      !(activeTabIndex === 0 && thisShift === -1) &&
      // can't go right on the last tab
      !(activeTabIndex === items.length - 1 && thisShift === 1);

    if (!shouldNavigate) {
      return;
    }

    const nextTabIndex = activeTabIndex + thisShift;
    const nextTabId = items[nextTabIndex]?.id;
    if (nextTabId) handleTabSelection(nextTabId);
  };

  const tabDropdownItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      disabled: item.id === items[activeTabIndex]?.id
    }));
  }, [items, activeTabIndex]);

  if (!items.length) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minWidth: 0, gap: '8px' }}>
      <span id="document-tabs-region-label" className={classes.tabsRegionLabel}>
        Document control area
      </span>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'start' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            disabled={activeTabIndex === 0}
            variant="inverse"
            data-test-id="btn-tab-previous"
            aria-label="Previous tab"
            onClick={() => moveToNextOrPreviousTab(-1)}
          >
            <span className="govuk-visually-hidden">Previous tab</span>
            <DownArrowIcon color="#1d70b8" rotateDegrees={90} />
          </Button>
          <Button
            disabled={activeTabIndex === items.length - 1}
            variant="inverse"
            data-test-id="btn-tab-next"
            aria-label="Next tab"
            onClick={() => moveToNextOrPreviousTab(1)}
          >
            <span className="govuk-visually-hidden">Next tab</span>
            <DownArrowIcon color="#1d70b8" rotateDegrees={270} />
          </Button>
        </div>
      </div>

      <div
        style={{ flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'hidden' }}
      >
        <ul className={`${classes.tabsList}`} role="tablist">
          {items.map((item, index) => {
            const { id, label, ariaLabel } = item;

            return (
              <li
                className={`${
                  activeTabIndex === index
                    ? classes.activeTab
                    : classes.inactiveTab
                } ${classes.tabListItem}`}
                key={id}
                data-testid={`tab-${index}`}
                role="presentation"
              >
                <button
                  id={`tab_${index}`}
                  aria-controls={
                    index === activeTabIndex
                      ? 'active-tab-panel'
                      : `panel-${index}`
                  }
                  aria-label={ariaLabel}
                  role="tab"
                  className={`${classes.tabButton} ${index === activeTabIndex ? 'tabButtonFocused' : ''}`}
                  data-testid={
                    index === activeTabIndex ? 'tab-active' : `btn-tab-${index}`
                  }
                  onClick={() => {
                    if (id !== items[activeTabIndex]?.id) {
                      handleTabSelection(id);
                    }
                  }}
                  onKeyDown={handleKeyPressOnTab}
                  tabIndex={index === activeTabIndex ? 0 : -1}
                  ref={index === activeTabIndex ? activeTabRef : undefined}
                >
                  <span className={classes.tabLabel}>{label}</span>
                </button>
                {activeTabIndex === index && (
                  <button
                    role="tab"
                    className={classes.tabCloseButton}
                    onClick={() => {
                      handleCloseTab(items[activeTabIndex]?.id);
                    }}
                    onKeyDown={handleKeyPressOnTab}
                    data-testid="tab-remove"
                    aria-label="close tab"
                  >
                    <CloseIcon />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ flexShrink: 0, display: 'flex' }}>
        <DropdownButton
          dropDownItems={tabDropdownItems}
          callBackFn={handleTabSelection}
          ariaLabel="tabs dropdown"
          dataTestId="tabs-dropdown"
          disabled={items.length < 2}
        />
      </div>
    </div>
  );
};

export default TabButtons;
