import { ChangeEvent, forwardRef, useState } from 'react';

type Props = {
  id: string;
  defaultValue?: string;
  label: string;
  hint?: string;
  error?: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxCharacters?: number;
};

export const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      id,
      defaultValue,
      disabled = false,
      label,
      hint,
      error,
      onChange,
      required,
      rows = 5,
      maxCharacters = 0,
    },
    ref,
  ) => {
    const [text, setText] = useState('');
    const hasError = !!error;

    const handleTextAreaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
      onChange(event.target.value);
    };

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

        <textarea
          className={`govuk-textarea ${hasError ? 'govuk-textarea--error' : ''}`}
          id={id}
          ref={ref}
          name={id}
          rows={rows}
          aria-describedby={[hint && `${id}-hint`, hasError && `${id}-error`]
            .filter(Boolean)
            .join(' ')}
          onChange={handleTextAreaChange}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          maxLength={maxCharacters || undefined}
        />

        {!!maxCharacters && (
          <div className="govuk-hint govuk-character-count__message" style={{ marginTop: '-25px' }}>
            You can enter up to {maxCharacters - text.length} characters
          </div>
        )}
      </div>
    );
  },
);
