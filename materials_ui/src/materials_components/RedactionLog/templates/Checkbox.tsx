type CheckboxProps = {
  id: string;
  label: string;
  hint?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  isSmall?: boolean;
};

export const Checkbox = ({ id, label, hint, checked, onChange, isSmall }: CheckboxProps) => {
  return (
    <div
      className={`govuk-checkboxes ${isSmall ? 'govuk-checkboxes--small' : ''}`}
      data-module="govuk-checkboxes"
    >
      <div className="govuk-checkboxes__item" style={{ flexWrap: 'wrap' }}>
        <input
          className={`govuk-checkboxes__input`}
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
          {label}
        </label>

        {hint && (
          <div id={`${id}-item-hint`} className="govuk-hint govuk-checkboxes__hint">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
};
