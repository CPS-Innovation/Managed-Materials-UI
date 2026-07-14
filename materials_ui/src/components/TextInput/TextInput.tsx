import { forwardRef } from 'react';

type Props = {
  id: string;
  defaultValue?: string;
  label: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 20;
  type?: 'text' | 'password' | 'date' | 'number';
  max?: string;
  min?: string;
  autocomplete?: string;
  spellCheck?: boolean;
  readonly?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      defaultValue = '',
      disabled = false,
      label,
      hint,
      error,
      max,
      min,
      onChange,
      required,
      width = 20,
      type = 'text',
      autocomplete,
      spellCheck,
      readonly = false,
    },
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

        <input
          ref={ref}
          type={type}
          className={`govuk-input govuk-input--width-${width} ${hasError ? 'govuk-input--error' : ''}`}
          id={id}
          name={id}
          aria-describedby={[hint && `${id}-hint`, hasError && `${id}-error`]
            .filter(Boolean)
            .join(' ')}
          onChange={(e) => onChange(e.target.value)}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          autoComplete={autocomplete}
          spellCheck={spellCheck}
          max={max}
          min={min}
          readOnly={readonly}
        />
      </div>
    );
  },
);
