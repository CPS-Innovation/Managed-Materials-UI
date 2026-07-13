import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import './_button-menu.scss';

type MenuItem = { label: string; onClick: () => void; className?: string; hide?: boolean };

type Props = { menuTitle: string; menuItems: MenuItem[]; isDisabled?: boolean };

export function ButtonMenuComponent({ menuTitle, menuItems, isDisabled = false }: Props) {
  const [openMenu, setOpenMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus helper
  const focusItem = (index: number) => {
    const visibleItems = itemsRef.current.filter(Boolean) as HTMLButtonElement[];
    if (!visibleItems.length) return;

    if (index >= visibleItems.length) index = 0;
    if (index < 0) index = visibleItems.length - 1;
    visibleItems[index]?.focus();
  };

  const currentFocusIndex = () => {
    const visibleItems = itemsRef.current.filter(
      (item): item is HTMLButtonElement => item !== null,
    );
    const active = document.activeElement;
    return active instanceof HTMLButtonElement ? visibleItems.indexOf(active) : -1;
  };

  const closeMenu = (moveFocus = true) => {
    setOpenMenu(false);
    if (moveFocus) buttonRef.current?.focus();
  };

  const handleToggleMenu = (keyboardEvent?: boolean) => {
    if (isDisabled) return;
    setOpenMenu((prev) => {
      const newState = !prev;
      if (newState && keyboardEvent) {
        setTimeout(() => focusItem(0), 0);
      }
      return newState;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const isToggle = event.target === buttonRef.current;
    const isMenuItem = itemsRef.current.filter(Boolean).includes(event.target as HTMLButtonElement);

    if (isToggle) {
      if (isDisabled) return;
      switch (key) {
        case 'ArrowDown':
          event.preventDefault();
          setOpenMenu(true);
          setTimeout(() => focusItem(0), 0);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setOpenMenu(true);
          setTimeout(() => focusItem(menuItems.length - 1), 0);
          break;
      }
    } else if (isMenuItem && openMenu) {
      switch (key) {
        case 'ArrowDown':
          event.preventDefault();
          focusItem(currentFocusIndex() + 1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusItem(currentFocusIndex() - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusItem(0);
          break;
        case 'End':
          event.preventDefault();
          focusItem(menuItems.length - 1);
          break;
      }
    }

    if (key === 'Escape' && openMenu) {
      event.preventDefault();
      closeMenu();
    }
    if (key === 'Tab' && openMenu) {
      closeMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      if (!buttonRef.current?.parentElement?.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div
      className={`moj-button-menu ${isDisabled ? 'disabled' : ''}`}
      style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={buttonRef}
        type="button"
        className="govuk-button moj-button-menu__toggle-button govuk-button--secondary"
        aria-haspopup="true"
        aria-expanded={openMenu}
        aria-disabled={isDisabled}
        onClick={() => handleToggleMenu(false)}
      >
        <span>
          {menuTitle}
          <svg
            width="11"
            height="5"
            viewBox="0 0 11 5"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: '8px', transform: openMenu ? 'rotate(0deg)' : 'rotate(180deg)' }}
          >
            <path d="M5.5 0L11 5L0 5L5.5 0Z" fill="currentColor" />
          </svg>
        </span>
      </button>

      {openMenu && (
        <ul role="menu" className="moj-button-menu__wrapper">
          {menuItems.map((item, i) =>
            item.hide ? null : (
              <li key={i}>
                <button
                  ref={(el) => {
                    itemsRef.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={`govuk-button moj-button-menu__item govuk-button--secondary ${
                    item.className || ''
                  }`}
                  onClick={() => {
                    item.onClick();
                    setTimeout(() => closeMenu(false), 50);
                  }}
                >
                  {item.label}
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
