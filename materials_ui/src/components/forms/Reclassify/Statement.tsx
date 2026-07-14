import { Control, Controller, FieldErrors } from 'react-hook-form';

import { DateField, Radios, SelectList, TextInput } from '../..';
import type { ReclassifyFormData } from '../../../hooks';
import { useCaseWitnesses, useWitnessStatements } from '../../../hooks';
import { UsedField } from './common/UsedField';

type Props = { control: Control; errors?: FieldErrors; data?: ReclassifyFormData };

export const Statement = ({ control, data, errors }: Props) => {
  const { selectOptions: witnessOptions, loading: isWitnessesLoading } = useCaseWitnesses();
  const { data: witnessStatements, setWitnessId } = useWitnessStatements();

  if (data?.classification !== 'STATEMENT') {
    return null;
  }

  const statementLabel = !witnessStatements?.length
    ? 'None'
    : witnessStatements.map((item) => `#${item.title}`).join(', ');

  return (
    <>
      <Controller
        control={control}
        name="subject"
        render={({ field }) => (
          <TextInput
            {...field}
            id={field.name}
            label="Material name"
            error={errors?.subject?.message as string}
            defaultValue={field.value}
            readonly
          />
        )}
      />

      <Controller
        name="witnessId"
        control={control}
        render={({ field }) => (
          <SelectList
            {...field}
            onChange={(value) => {
              setWitnessId(+value);
              if (value === '') {
                field.onChange(undefined);
              } else {
                field.onChange(+value);
              }
            }}
            id={field.name}
            label="Who is the witness?"
            error={errors?.witnessId?.message as string}
            defaultValue={field?.value?.toString()}
            disabled={isWitnessesLoading}
            options={[
              ...(isWitnessesLoading
                ? [{ label: 'Loading...', value: '', id: '' }]
                : [{ label: 'Select witness', value: '', id: '' }]),
              ...witnessOptions,
              { label: 'Witness not on the list - add witness', value: '0', id: '0' },
            ]}
          />
        )}
      />
      {data?.witnessId === 0 && (
        <p style={{ margin: '-20px 0 20px' }}>
          <strong>You will be asked to add a new witness on the next page.</strong>
        </p>
      )}

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

      {data?.hasStatementDate && (
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
            type="number"
            id={field.name}
            hint={`Already in use: ${statementLabel}`}
            label="Statement number"
            error={errors?.statementNumber?.message as string}
            width={4}
            defaultValue={field.value}
          />
        )}
      />

      <UsedField control={control} errors={errors} />
    </>
  );
};
