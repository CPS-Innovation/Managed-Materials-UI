import styles from '../RedactionLogModal.module.scss';

type Option = { id: string; name: string };

type SelectDropdownProps = {
  label: string;
  id: string;
  name: string;
  options: Option[];
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string | undefined;
};

export const SelectDropdown = ({
  label,
  id,
  name,
  options,
  value,
  onChange,
  error
}: SelectDropdownProps) => (
  <div
    className={styles.selectWrapper + (error ? ` govuk-form-group--error` : '')}
  >
    <label className="govuk-label" htmlFor={id}>
      {label}
    </label>

    <p id="location-error" className="govuk-error-message">
      <span className="govuk-visually-hidden">Error:</span> {error}
    </p>

    <select
      className={`govuk-select ${error ? 'govuk-select--error' : ''}`}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
    >
      <option value="" disabled selected={value === ''}>
        Please select
      </option>
      {options.map((option) => (
        <option key={`${option.id}-${option.name}`} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);
