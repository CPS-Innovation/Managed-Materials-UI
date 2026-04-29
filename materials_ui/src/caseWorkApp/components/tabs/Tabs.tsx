import { useLastFocus } from '../../hooks/useLastFocus';
import { Button } from '../button';
import TabButtons from './TabButtons';
import classes from './Tabs.module.scss';
import { CommonTabsProps } from './types';

export type TabsProps = CommonTabsProps & {
  activeTabId: string;
  handleTabSelection: (documentId: string) => void;
  handleCloseTab: (v?: string) => void;
  noMargin?: boolean;
  onShowHideCategoriesClick: () => void;
  isShowCategories: boolean;
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTabId,
  handleTabSelection,
  handleCloseTab,
  noMargin,
  onShowHideCategoriesClick,
  isShowCategories,
  ...attributes
}) => {
  useLastFocus('#case-details-search');

  const activeTabArrayPos = items.findIndex((item) => item.id === activeTabId);
  const activeTabIndex = activeTabArrayPos === -1 ? 0 : activeTabArrayPos;

  const handleRegionKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (
    ev
  ) => {
    if (ev.target !== ev.currentTarget) return;
    if (ev.code === 'ArrowLeft' || ev.code === 'ArrowRight') {
      ev.preventDefault();
      const shift = ev.code === 'ArrowLeft' ? -1 : 1;
      const nextId = items[activeTabIndex + shift]?.id;
      if (nextId) handleTabSelection(nextId);
    } else if (ev.code === 'ArrowDown') {
      ev.preventDefault();
      document.getElementById('tabs-dropdown')?.click();
      setTimeout(() => {
        document
          .querySelector<HTMLElement>('#dropdown-panel button:not(:disabled)')
          ?.focus();
      }, 0);
    }
  };

  return (
    <>
      <div
        id="document-tabs"
        role="region"
        aria-labelledby="document-tabs-region-label"
        tabIndex={0}
        onKeyDown={handleRegionKeyDown}
        style={{
          display: 'flex',
          gap: '8px',
          width: '100%',
          alignItems: 'start'
        }}
      >
        <div style={{ flexShrink: 0, display: 'flex' }}>
          <Button size="s" onClick={() => onShowHideCategoriesClick()}>
            {isShowCategories ? 'Hide categories' : 'Show categories'}
          </Button>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <TabButtons
            items={items.map((item) => ({
              id: item.id,
              label: item.label,
              ariaLabel: `Document ${item.label}`
            }))}
            activeTabIndex={activeTabIndex}
            handleTabSelection={handleTabSelection}
            handleCloseTab={handleCloseTab}
          />
        </div>
      </div>

      <div
        data-testid="tabs"
        className={`govuk-tabs ${classes.tabs}${noMargin ? ` ${classes.noMargin}` : ''}`}
        {...attributes}
      >
        {items.map((item, index) => {
          const { id: itemId, panel } = item;
          const panelId = itemId;

          return (
            <div
              id={
                index === activeTabIndex ? 'active-tab-panel' : `panel-${index}`
              }
              aria-labelledby={
                index === activeTabIndex
                  ? 'document-panel-region-label'
                  : `tab_${index}`
              }
              key={panelId}
              role="tabpanel"
              tabIndex={0}
              data-testid={`tab-content-${itemId}`}
              className={`govuk-tabs__panel ${
                index !== activeTabIndex ? classes.hideTabDocument : ''
              }  ${classes.contentArea}`}
            >
              {index === activeTabIndex && (
                <span
                  id="document-panel-region-label"
                  className={classes.tabPanelRegionLabel}
                >
                  Document view port
                </span>
              )}
              {panel?.children}
            </div>
          );
        })}
      </div>
    </>
  );
};
