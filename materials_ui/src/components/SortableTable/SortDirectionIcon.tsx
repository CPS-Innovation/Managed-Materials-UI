import { SortBy } from '../../context/FiltersContext/helpers/types';

export type SortDirection = SortBy | 'none';

export const SortDirectionIcon = ({ direction }: { direction: SortDirection }) => {
  if (direction === 'ascending') {
    return (
      <svg
        className="sortable-table-sort-icon"
        viewBox="0 0 12 8"
        width="12"
        height="8"
        focusable="false"
        aria-hidden="true"
        role="img"
      >
        <path d="M6 0L12 8H0L6 0Z" />
      </svg>
    );
  }

  if (direction === 'descending') {
    return (
      <svg
        className="sortable-table-sort-icon"
        viewBox="0 0 12 8"
        width="12"
        height="8"
        focusable="false"
        aria-hidden="true"
        role="img"
      >
        <path d="M6 8L0 0H12L6 8Z" />
      </svg>
    );
  }

  return (
    <svg
      className="sortable-table-sort-icon"
      viewBox="0 0 12 16"
      width="10"
      height="14"
      focusable="false"
      aria-hidden="true"
      role="img"
    >
      <path d="M6 0L10 6H2L6 0Z" />
      <path d="M6 16L2 10H10L6 16Z" />
    </svg>
  );
};
