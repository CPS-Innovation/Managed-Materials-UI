import { forwardRef } from 'react';

export type SelectOption = {
  value: string | number;
  label: string;
  id: string | number;
  disabled?: boolean;
};

type Props = {
  id: string;
  defaultValue?: string | number;
  disabled?: boolean;
  label: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  value?: string | number;
};

export const SelectList = forwardRef<HTMLSelectElement, Props>(
  (
    { id, defaultValue, disabled = false, label, hint, error, options, onChange, required, value },
    ref,
  ) => {
    const hasError = !!error;

    return (
      <div className={`govuk-form-group ${hasError ? 'govuk-form-group--error' : ''}`}>
        <label className="govuk-label" htmlFor={id} style={{ fontWeight: 700 }}>
          {label}
        </label>

        {hint && (
          <div id={`${id}-hint`} className="govuk-hint">
            {hint}
          </div>
        )}

        {hasError && (
          <p id={`${id}-error`} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}

        <select
          ref={ref}
          className={`govuk-select ${hasError ? 'govuk-select--error' : ''}`}
          id={id}
          name={id}
          aria-describedby={[hint && `${id}-hint`, hasError && `${id}-error`]
            .filter(Boolean)
            .join(' ')}
          onChange={(e) => onChange(e.target.value)}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          required={required}
        >
          {options.map(({ value, label, id, disabled = false }) => (
            <option key={id} value={value} id={`option-${id}`} disabled={disabled}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
