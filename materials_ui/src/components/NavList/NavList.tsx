import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';

import { CPSLink } from '..';
import { isPathCurrentUrl } from '../../utils/url';
import './NavList.scss';

export type NavListItem = { href: string; name: string };
export type NavListSection = { headerLabel?: string; items: NavListItem[] };

type Props = {
  items?: NavListItem[];
  headerLabel?: string;
  sections?: NavListSection[];
};

export const NavList = ({ items = [], headerLabel, sections }: Props) => {
  const { pathname } = useLocation();
  const navSections = sections ?? [{ headerLabel, items }];

  if (navSections.every((section) => section.items.length === 0)) {
    return null;
  }

  return (
    <nav
      className="moj-side-navigation cps-side-navigation"
      aria-label="Side navigation"
    >
      {navSections.map((section, sectionIndex) => {
        if (section.items.length === 0) {
          return null;
        }

        return (
          <Fragment key={section.headerLabel ?? `section-${sectionIndex}`}>
            {section.headerLabel ? (
              <h3 className="govuk-heading-s govuk-!-margin-bottom-1">
                {section.headerLabel}
              </h3>
            ) : null}
            <ul className="moj-side-navigation__list">
              {section.items.map((item) => {
                const isCurrentPage = isPathCurrentUrl(pathname, item.href);

                return (
                  <li
                    key={item.href}
                    className={`moj-side-navigation__item${isCurrentPage ? ' moj-side-navigation__item--active' : ''}`}
                  >
                    <CPSLink to={item.href}>{item.name}</CPSLink>
                  </li>
                );
              })}
            </ul>
          </Fragment>
        );
      })}
    </nav>
  );
};
