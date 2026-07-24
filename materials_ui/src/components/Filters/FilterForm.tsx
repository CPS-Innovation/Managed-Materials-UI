import { ReactNode } from 'react';
import { SearchInput } from '../SearchInput/SearchInput';
import './Filters.scss';

type FilterFormProps = {
  onSubmit: () => void;
  onReset: () => void;
  onSearchChange: (searchTerm: string) => void;
  searchLabel: string;
  defaultSearchValue: string;
  children: ReactNode;
};

export const FilterForm = ({
  onSubmit,
  onReset,
  onSearchChange,
  searchLabel,
  defaultSearchValue,
  children,
}: FilterFormProps) => {
  return (
    <form
      className="filters-container"
      id="filters"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="filters-container__header">
        <h2 className="filters-container__heading govuk-heading-m">Filters</h2>
        <button
          type="button"
          className="govuk-link link filters-container__clear-button"
          onClick={onReset}
          aria-label="Clear filters"
        >
          Clear filters
        </button>
      </div>

      <div className="govuk-form-group">
        <SearchInput
          placeholder=""
          label={searchLabel}
          id="search"
          onSearch={() => onSubmit()}
          onChange={onSearchChange}
          defaultValue={defaultSearchValue}
        />
      </div>

      {children}

      <div className="filters-container__actions">
        <button
          type="submit"
          className="govuk-button"
          data-module="govuk-button"
          data-testid="applyFiltersButton"
        >
          Apply filters
        </button>
        <button
          type="button"
          className="govuk-link link filters-container__clear-button filters-container__clear-button--actions"
          onClick={onReset}
          aria-label="Clear filters"
        >
          Clear filters
        </button>
      </div>
    </form>
  );
};
