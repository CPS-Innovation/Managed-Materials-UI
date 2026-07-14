import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

type Props = {
  id: string;
  error?: string;
  hint?: string;
  label: string;
  onChange: (value: Date) => void;
  value?: Date;
};

export const DateField = forwardRef<HTMLInputElement, Props>(
  ({ error, id, hint, label, onChange, value }, ref) => {
    const initialDate = value && dayjs(value).isValid() ? dayjs(value) : null;

    const [day, setDay] = useState<string>(initialDate ? String(initialDate.date()) : '');
    const [month, setMonth] = useState<string>(initialDate ? String(initialDate.month() + 1) : '');
    const [year, setYear] = useState<string>(initialDate ? String(initialDate.year()) : '');

    // Internal refs
    const dayRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => dayRef.current as HTMLInputElement);

    useEffect(() => {
      if (day && month && year) {
        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const parsed = dayjs(dateStr, 'YYYY-MM-DD', true);
        if (parsed.isValid()) {
          onChange(parsed.toDate());
        }
      }
    }, [day, month, year, onChange]);

    return (
      <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
        <fieldset className="govuk-fieldset" role="group" aria-describedby={`${id}-hint`}>
          <legend
            className="govuk-fieldset__legend govuk-fieldset__legend--l"
            style={{ fontSize: 19 }}
          >
            {label}
          </legend>

          {hint && (
            <div id={`${id}-hint`} className="govuk-hint">
              {hint}
            </div>
          )}

          {error && (
            <p id={`${id}-error`} className="govuk-error-message">
              <span className="govuk-visually-hidden">Error:</span> {error}
            </p>
          )}

          <div className="govuk-date-input" id={id}>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-day`}>
                  Day
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ' govuk-input--error' : ''}`}
                  id={`${id}-day`}
                  name={`${id}-day`}
                  type="text"
                  inputMode="numeric"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  ref={dayRef}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-month`}>
                  Month
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ' govuk-input--error' : ''}`}
                  id={`${id}-month`}
                  name={`${id}-month`}
                  type="text"
                  inputMode="numeric"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  ref={monthRef}
                />
              </div>
            </div>
            <div className="govuk-date-input__item">
              <div className="govuk-form-group">
                <label className="govuk-label govuk-date-input__label" htmlFor={`${id}-year`}>
                  Year
                </label>
                <input
                  className={`govuk-input govuk-date-input__input govuk-input--width-4${error ? ' govuk-input--error' : ''}`}
                  id={`${id}-year`}
                  name={`${id}-year`}
                  type="text"
                  inputMode="numeric"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  ref={yearRef}
                />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
    );
  },
);
