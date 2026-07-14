import { ChangeEvent } from 'react';

export type Props = {
  id: string;
  label: string;
  checked?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  ariaLabel?: string;
  labelVisuallyHidden?: boolean;
  value?: string;
};

export default function Checkbox({
  id,
  label,
  checked,
  ariaLabel,
  labelVisuallyHidden,
  onChange,
  value,
}: Props) {
  return (
    <div
      className="govuk-checkboxes govuk-checkboxes--small"
      data-module="govuk-checkboxes"
      data-testid={`checkbox-${id}`}
    >
      <div className="govuk-checkboxes__item">
        <input
          className="govuk-checkboxes__input"
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          data-testid={id}
          aria-label={ariaLabel}
          value={value}
        />
        <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
          {labelVisuallyHidden ? <span className="govuk-visually-hidden">{label}</span> : label}
        </label>
      </div>
    </div>
  );
}
