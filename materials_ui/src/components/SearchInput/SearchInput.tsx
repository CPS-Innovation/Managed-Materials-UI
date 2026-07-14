import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

export type Props = {
  id: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  hideButton?: boolean;
  label: string;
  placeholder: string;
  defaultValue?: string;
};

export const SearchInput = ({
  id,
  defaultValue,
  onChange,
  onSearch,
  hideButton = true,
  label,
  placeholder,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchClick = () => {
    if (onSearch && searchTerm.trim()) onSearch(searchTerm);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    setSearchTerm(value);
    if (onChange) onChange(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchTerm.trim()) {
      event.preventDefault();
      handleSearchClick();
    }
  };

  useEffect(() => {
    if (defaultValue !== searchTerm) {
      setSearchTerm(defaultValue || '');
    }
  }, [defaultValue]);

  return (
    <div className="searchForm">
      <label className="govuk-label--s govuk-label" htmlFor={id}>
        {label}
      </label>
      <div
        className="search-form-container"
        style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <input
          className="govuk-input"
          id={id}
          name={id}
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />

        {!hideButton && (
          <button
            type="submit"
            className="govuk-button search-button"
            data-module="govuk-button"
            onClick={handleSearchClick}
            style={{ height: '38px' }}
            disabled={!searchTerm.trim()}
          >
            Search
          </button>
        )}
      </div>
    </div>
  );
};
