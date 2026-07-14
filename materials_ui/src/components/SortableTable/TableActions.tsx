import { useEffect, useRef, useState } from 'react';
import { Button } from '../../caseWorkApp/components/button';
import { useCaseInfoStore, useLogger } from '../../hooks';
import { CaseMaterialsType } from '../../schemas';
import { ButtonMenuComponent } from '../ButtonMenu/ButtonMenu';

type MenuItem = { label: string; onClick: () => void; hide?: boolean };

type Props = {
  showFilter: boolean;
  onSetShowFilter: (prev: boolean) => void;
  menuItems?: MenuItem[];
  selectedItems: CaseMaterialsType[];
};

export function TableActions({
  showFilter,
  onSetShowFilter,
  menuItems = [],
  selectedItems,
}: Props) {
  const { caseInfo } = useCaseInfoStore();
  const [isSticky, setIsSticky] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { log } = useLogger();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const filterStatus = showFilter ? 'showing' : 'hidden';

  return (
    <>
      <div ref={ref} style={{ height: 1 }}></div>
      <div className={`govuk-grid-row search-input-container ${isSticky ? 'is-sticky' : ''}`}>
        <div className="search-input-row">
          {!isSticky && (
            <div className="filter-button">
              <Button
                size="s"
                data-module="govuk-button"
                data-govuk-button-init=""
                onClick={() => {
                  onSetShowFilter(!showFilter);
                  log({
                    logLevel: 1,
                    message: `HK-UI-FE: caseId [${caseInfo?.id}] - filter panel is now ${filterStatus}.`,
                  });
                }}
              >
                {showFilter ? 'Hide' : 'Show'} filters
                <span data-ismodified="1" className="br_wrap"></span>
              </Button>
            </div>
          )}

          <div className="action-buttons-container">
            <ButtonMenuComponent
              menuTitle="Action on selection"
              menuItems={menuItems}
              isDisabled={selectedItems?.length === 0}
            />
          </div>
        </div>
      </div>
    </>
  );
}
