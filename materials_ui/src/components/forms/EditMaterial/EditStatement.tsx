import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useCaseWitnesses, useWitnessStatements } from '../../../hooks/index.ts';
import { EditStatementSchema, EditStatementType } from '../../../schemas/forms/editStatement.ts';
import { CaseMaterialsType } from '../../../schemas/index.ts';
import { SelectList } from '../../SelectList/SelectList.tsx';

import { DateField } from '../../DateField/DateField.tsx';
import { Radios } from '../../Radios/Radios.tsx';
import { TextInput } from '../../TextInput/TextInput.tsx';
import { UsedField } from '../Reclassify/common/UsedField.tsx';

type Props = {
  formState: EditStatementType | null;
  material: CaseMaterialsType;
  onSuccess: (data: EditStatementType) => void;
  cancelUrl: string;
};

export const EditStatementForm = ({ formState, material, onSuccess, cancelUrl }: Props) => {
  const { selectOptions, loading: isWitnessesLoading } = useCaseWitnesses();
  const {
    data: witnessStatements,
    loading: isWitnessStatementsLoading,
    setWitnessId,
  } = useWitnessStatements();

  const matchedStatement = witnessStatements.find(
    (statement) => statement.id === material.materialId,
  );

  const defaultStatementNumber = matchedStatement
    ? `#${matchedStatement.title.toString()}`
    : 'none';

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EditStatementType>({
    // @ts-expect-error fix type here
    resolver: zodResolver(EditStatementSchema),
    defaultValues: {
      hasStatementDate: formState ? formState?.hasStatementDate : !!material?.recordedDate,
      materialId: material?.materialId,
      statementDate: formState?.statementDate || material?.recordedDate || undefined,
      statementNumber: formState?.statementNumber || undefined,
      used: formState ? formState.used : material?.status === 'Used',
      witnessId: formState?.witnessId || material?.witnessId || undefined,
    },
  });

  const fieldValues = watch();

  const handleFormSubmit = (data: EditStatementType) => {
    onSuccess(data);
  };

  useEffect(() => {
    setWitnessId(fieldValues.witnessId);
  }, [fieldValues.witnessId]);

  if (material?.category !== 'Statement') {
    return null;
  }

  const statementLabel = !witnessStatements?.length
    ? 'none'
    : witnessStatements.map((item) => `#${item.title}`).join(', ');

  const statementNumberHint = () => {
    if (isWitnessStatementsLoading) {
      return 'Checking...';
    }

    if (witnessStatements?.length > 1) {
      return `Already in use: ${statementLabel}. Current statement number: ${defaultStatementNumber}`;
    }

    return `Already in use: ${statementLabel}.`;
  };

  return (
    <>
      <h2 className="govuk-caption-l hmrc-caption-l">
        <span className="govuk-visually-hidden">This section is </span>
        Update
      </h2>
      <h1 className="govuk-heading-l">Statement</h1>

      {/* @ts-expect-error fix type */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Controller
          name="witnessId"
          control={control}
          render={({ field }) => (
            <SelectList
              {...field}
              onChange={(value) => {
                field.onChange(value === '' ? undefined : +value);
              }}
              disabled={isWitnessesLoading}
              id={field.name}
              label="Who is the witness?"
              error={errors?.witnessId?.message as string}
              options={[
                { label: isWitnessesLoading ? 'Loading...' : 'Select witness', value: '', id: '' },
                ...selectOptions,
              ]}
            />
          )}
        />

        <Controller
          name="hasStatementDate"
          control={control}
          render={({ field }) => (
            <Radios
              {...field}
              value={field.value !== undefined ? (field.value ? 'true' : 'false') : undefined}
              id={field.name}
              legend="Does the statement have a date?"
              options={[
                { id: 'true', value: 'true', label: 'Yes' },
                { id: 'false', value: 'false', label: 'No' },
              ]}
              required
              error={errors?.hasStatementDate?.message as string}
              onChange={(option) => {
                field.onChange(option.value === 'true');
              }}
              inline
            />
          )}
        />

        {fieldValues?.hasStatementDate && (
          <div
            className="govuk-radios__conditional"
            style={{ marginTop: '-20px', marginBottom: '30px' }}
          >
            <Controller
              control={control}
              name="statementDate"
              render={({ field }) => (
                <DateField
                  {...field}
                  id={field.name}
                  hint="For example, 27 3 2025"
                  label="Statement date"
                  error={errors?.statementDate?.message as string}
                />
              )}
            />
          </div>
        )}

        <Controller
          control={control}
          name="statementNumber"
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              hint={statementNumberHint()}
              label="What is the statement number?"
              error={errors?.statementNumber?.message as string}
              width={4}
              defaultValue={field.value || undefined}
              type="number"
            />
          )}
        />

        {/* @ts-expect-error fix control type */}
        <UsedField control={control} errors={errors} />

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button" data-module="govuk-button">
            Continue
          </button>
          <Link to={cancelUrl} className="govuk-link cancel-status-change">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
};
