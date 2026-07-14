import { forwardRef, Fragment, ReactNode } from 'react';

export type RadioOption = {
  id: string | number;
  label: string;
  value: string | number;
  disabled?: boolean;
  conditionalField?: ReactNode;
};

export type Props = {
  defaultValue?: string | number | boolean;
  error?: string;
  legend: string;
  id?: string;
  name: string;
  onChange: (option: RadioOption) => void;
  options: RadioOption[];
  required?: boolean;
  value?: string;
  inline?: boolean;
};

export const Radios = forwardRef<HTMLInputElement, Props>(
  (
    { error, id, legend, name, onChange, options, required = false, inline, value, defaultValue },
    ref,
  ) => {
    return (
      <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
        <fieldset
          className="govuk-fieldset"
          role="radiogroup"
          aria-required={required}
          aria-invalid={!!error}
          id={id}
        >
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">{legend}</legend>

          {error && (
            <p className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          )}

          <div
            className={`govuk-radios${inline ? ' govuk-radios--inline' : ''}`}
            data-module="govuk-radios"
          >
            {options.map((option) => (
              <Fragment key={option.id}>
                <div className="govuk-radios__item">
                  <input
                    ref={ref}
                    className="govuk-radios__input"
                    id={`radio-${option.id}`}
                    name={name}
                    disabled={option.disabled}
                    type="radio"
                    value={option.value}
                    checked={option.value === value}
                    onChange={() => onChange(option)}
                  />
                  <label className="govuk-label govuk-radios__label" htmlFor={`radio-${option.id}`}>
                    {option.label}
                  </label>
                </div>

                {option.conditionalField &&
                  (option.value === defaultValue || value === option.value) && (
                    <div className="govuk-radios__conditional">{option.conditionalField}</div>
                  )}
              </Fragment>
            ))}
          </div>
        </fieldset>
      </div>
    );
  },
);
