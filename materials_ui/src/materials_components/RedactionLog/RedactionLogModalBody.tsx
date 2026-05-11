import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TLookups } from '../../caseWorkApp/components/utils/getData';
import { TDocument } from '../DocumentSelectAccordion/getters/getDocumentList';
import { TRedactionType } from '../PdfRedactor/PdfRedactionTypeForm';
import { TRedaction } from '../PdfRedactor/utils/coordUtils';
import { Popover } from './Popover';
import styles from './RedactionLogModal.module.scss';
import { Checkbox } from './templates/Checkbox';
import { ErrorSummary } from './templates/ErrorSummary';

type Mode = 'over-under' | 'list';

type RedactionLogModalBodyProps = {
  activeDocument?: TDocument | null;
  mode?: Mode;
  redactions?: TRedaction[];
  selectedRedactionTypes?: TRedactionType[];
  lookups: TLookups;
};

export type RedactionLogFormValues = {
  underRedactionSelected: boolean;
  overRedactionSelected: boolean;
  redactionCategorySelected: boolean;

  underRedactionTypeIds: number[];
  overRedactionTypeIds: number[];

  overReason: 'investigative-agency' | 'cps-colleague' | null;
  supportingNotes: string;
};

const RedactionTypesGrid = ({
  value,
  onChange,
  redactionTypes = []
}: {
  value: number[];
  onChange: (next: number[]) => void;
  redactionTypes?: Array<{ id: number; name: string }>;
}) => {
  const selected = new Set(value);

  const onToggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(Array.from(next));
  };

  return (
    <div
      className="govuk-checkboxes"
      id="conditional-contact"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginTop: '8px'
      }}
    >
      {redactionTypes.map((type) => (
        <Checkbox
          key={`${type.id}`}
          id={`redaction-type-${type.id}`}
          label={type.name}
          checked={selected.has(parseInt(type.id.toString()))}
          onChange={() => onToggle(parseInt(type.id.toString()))}
          isSmall
        />
      ))}
    </div>
  );
};

export const RedactionLogModalBody = ({
  activeDocument,
  mode,
  selectedRedactionTypes,
  lookups
}: RedactionLogModalBodyProps) => {
  const {
    control,
    register,
    watch,
    formState: { errors }
  } = useFormContext<RedactionLogFormValues>();

  const [showPopover, setShowPopover] = useState(false);

  const underRedactionSelected = watch('underRedactionSelected');
  const overRedactionSelected = watch('overRedactionSelected');
  const supportingNotes = watch('supportingNotes') ?? '';
  const supportingNotesRemaining = Math.max(0, 400 - supportingNotes.length);

  const redactionTypes =
    lookups?.missedRedactions?.map((redaction) => ({
      id: parseInt(redaction.id),
      name: redaction.name
    })) || [];

  return (
    <div className={styles.modalBody}>
      <ErrorSummary errors={errors} />

      <h2>Redaction details for: {activeDocument?.presentationTitle}</h2>

      {mode === 'list' && selectedRedactionTypes && (
        <div className="govuk-form-group">
          {selectedRedactionTypes.length > 0 && (
            <ul className="govuk-list">
              {Object.entries(
                selectedRedactionTypes.reduce(
                  (acc, x) => {
                    const current = acc[x.id];
                    acc[x.id] = {
                      name: current?.name ?? x.name,
                      count: (current?.count ?? 0) + 1
                    };
                    return acc;
                  },
                  {} as Record<string, { name: string; count: number }>
                )
              ).map(([id, value]) => (
                <li key={id}>
                  {value.count} - {value.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === 'over-under' && (
        <div
          className={
            `govuk-form-group` +
            (errors.redactionCategorySelected ? ' govuk-form-group--error' : '')
          }
        >
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend">
              Confirm the redaction type
            </legend>

            {errors.redactionCategorySelected && (
              <p className="govuk-error-message">
                {errors.redactionCategorySelected.message}
              </p>
            )}

            <Controller
              name="underRedactionSelected"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="under-redaction"
                  label="Under Redaction"
                  hint="Returned to Investigative Agency for correction"
                  checked={!!field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              )}
            />

            {underRedactionSelected && (
              <div
                className="govuk-checkboxes__conditional"
                id="conditional-under-redaction"
                style={{ marginTop: 8 }}
              >
                <div
                  className={`govuk-form-group ${errors.underRedactionTypeIds ? 'govuk-form-group--error' : ''}`}
                >
                  <Controller
                    name="underRedactionTypeIds"
                    control={control}
                    rules={{
                      validate: (arr) => {
                        if (!underRedactionSelected) return true;
                        if (arr && arr.length > 0) return true;
                        return 'Select an under redaction type';
                      }
                    }}
                    render={({ field }) => (
                      <>
                        {errors.underRedactionTypeIds && (
                          <p className="govuk-error-message">
                            {errors.underRedactionTypeIds.message}
                          </p>
                        )}

                        <legend className="govuk-fieldset__legend">
                          Types of redaction
                        </legend>
                        <RedactionTypesGrid
                          value={field.value ?? []}
                          onChange={field.onChange}
                          redactionTypes={redactionTypes}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
            )}

            <Controller
              name="overRedactionSelected"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="over-redaction"
                  label="Over Redaction"
                  checked={!!field.value}
                  onChange={() => field.onChange(!field.value)}
                />
              )}
            />

            <Controller
              name="redactionCategorySelected"
              control={control}
              rules={{
                validate: () =>
                  underRedactionSelected || overRedactionSelected
                    ? true
                    : 'Select a redaction category'
              }}
              render={() => <></>}
            />

            {overRedactionSelected && (
              <div
                className="govuk-checkboxes__conditional"
                id="conditional-over-redaction"
                style={{ marginTop: 8 }}
              >
                <div
                  className={`govuk-form-group ${errors.overReason?.message ? 'govuk-form-group--error' : ''}`}
                >
                  {errors.overReason?.message && (
                    <p className="govuk-error-message">
                      {errors.overReason?.message}
                    </p>
                  )}
                  <Controller
                    name="overReason"
                    control={control}
                    rules={{
                      validate: (value) => {
                        if (!overRedactionSelected) return true;
                        if (
                          value === 'investigative-agency' ||
                          value === 'cps-colleague'
                        )
                          return true;
                        return 'Select an under redaction type';
                      }
                    }}
                    render={({ field }) => (
                      <div
                        className="govuk-radios govuk-radios--small"
                        data-module="govuk-radios"
                      >
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="over-reason-ia"
                            name={field.name}
                            type="radio"
                            value="investigative-agency"
                            checked={field.value === 'investigative-agency'}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor="over-reason-ia"
                          >
                            Returned to Investigative Agency for correction
                          </label>
                        </div>
                        <div className="govuk-radios__item">
                          <input
                            className="govuk-radios__input"
                            id="over-reason-colleague"
                            name={field.name}
                            type="radio"
                            value="cps-colleague"
                            checked={field.value === 'cps-colleague'}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                          <label
                            className="govuk-label govuk-radios__label"
                            htmlFor="over-reason-colleague"
                          >
                            Returned to CPS colleague for correction
                          </label>
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div
                  className={`govuk-form-group ${errors.overRedactionTypeIds ? 'govuk-form-group--error' : ''}`}
                >
                  <Controller
                    name="overRedactionTypeIds"
                    control={control}
                    rules={{
                      validate: (arr) => {
                        if (!overRedactionSelected) return true;
                        if (arr && arr.length > 0) return true;
                        return 'Select an over redaction type';
                      }
                    }}
                    render={({ field }) => (
                      <>
                        <legend className="govuk-fieldset__legend">
                          Types of redaction
                        </legend>

                        {errors.overRedactionTypeIds && (
                          <p className="govuk-error-message">
                            {errors.overRedactionTypeIds.message}
                          </p>
                        )}
                        <RedactionTypesGrid
                          value={field.value ?? []}
                          onChange={field.onChange}
                          redactionTypes={redactionTypes}
                        />
                      </>
                    )}
                  />
                </div>
              </div>
            )}
          </fieldset>
        </div>
      )}

      <div
        className={`govuk-form-group ${errors.supportingNotes ? 'govuk-form-group--error' : ''} govuk-!-margin-bottom-0`}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'space-between',
            width: '50%',
            position: 'relative'
          }}
        >
          <label className="govuk-label" htmlFor="supportingNotes">
            Supporting notes (optional)
          </label>
          {errors.supportingNotes && (
            <p className="govuk-error-message">
              {errors.supportingNotes.message}
            </p>
          )}

          <a
            className="govuk-link"
            onClick={() => setShowPopover(!showPopover)}
            style={{ fontSize: '19px' }}
          >
            Guidance on supporting notes
          </a>

          {showPopover && (
            <Popover
              title="Guidance on supporting notes"
              content={() => {
                return (
                  <ul style={{ paddingLeft: '1rem', fontSize: '19px' }}>
                    <li>
                      Detail the redaction issue identified, e.g. Statement of
                      XX (Initials) DOB redacted
                    </li>
                    <li>Avoid recording full names</li>
                    <li>Do not record sensitive personal data</li>
                    <li>Supporting notes optional - 400 characters maximum</li>
                  </ul>
                );
              }}
            />
          )}
        </div>

        <textarea
          className="govuk-textarea"
          id="supportingNotes"
          rows={5}
          style={{ width: '50%' }}
          maxLength={400}
          {...register('supportingNotes', {
            maxLength: {
              value: 400,
              message: 'Supporting notes cannot exceed 400 characters'
            }
          })}
        />

        <p className="govuk-body govuk-!-margin-top-2 govuk-!-margin-bottom-0">
          You have {supportingNotesRemaining} characters remaining
        </p>
      </div>
    </div>
  );
};
