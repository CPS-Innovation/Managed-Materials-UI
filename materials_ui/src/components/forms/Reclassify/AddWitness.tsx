import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { URL } from '../../../constants/url.ts';
import { useCaseDefendants } from '../../../hooks/index.ts';
import {
  Reclassify_WitnessAndActionPlanSchema,
  type Reclassify_WitnessAndActionPlanType,
} from '../../../schemas/forms/reclassify.ts';
import { formatDateInputValue } from '../../../utils/date.ts';
import type { ErrorSummaryItem } from '../../ErrorSummary/ErrorSummary.tsx';
import { ErrorSummary, Radios, SelectList, TextArea, TextInput } from '../../index.ts';

type Props = {
  data: Reclassify_WitnessAndActionPlanType;
  onSave: (data: Reclassify_WitnessAndActionPlanType) => void;
};

export const AddWitness = ({ data, onSave }: Props) => {
  const { selectOptions: defendantSelectOptions } = useCaseDefendants();
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<Reclassify_WitnessAndActionPlanType>({
    defaultValues: data,
    // @ts-expect-error fix type
    resolver: zodResolver(Reclassify_WitnessAndActionPlanSchema),
  });

  // format react-hook-form error object into array to be rendered by ErrorSummary
  const errorSummary = Object.entries(errors).map(([key, entry]) => {
    return { id: key, message: entry?.message || '' };
  });

  const followUp = watch('followUp');

  return (
    <>
      <ErrorSummary
        errorTitle="There was a problem"
        errorMessage={errorSummary as ErrorSummaryItem[]}
      />

      {/* @ts-expect-error fix type*/}
      <form onSubmit={handleSubmit(onSave)} noValidate>
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              label="First name"
              autocomplete="given-name"
              spellCheck={false}
              error={errors?.firstName?.message as string}
              defaultValue={field?.value?.toString() || ''}
            />
          )}
        />

        <Controller
          control={control}
          name="surname"
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              label="Last name"
              autocomplete="family-name"
              spellCheck={false}
              error={errors?.surname?.message as string}
              defaultValue={field?.value?.toString() || ''}
            />
          )}
        />

        <Controller
          control={control}
          name="actionPointText"
          render={({ field }) => (
            <TextArea
              {...field}
              id={field.name}
              label="Contested issue"
              hint="Please provide the items outlined in this action plan."
              error={errors?.actionPointText?.message as string}
              defaultValue={field?.value?.toString() || ''}
            />
          )}
        />

        <Controller
          name="requestType"
          control={control}
          render={({ field }) => (
            <Radios
              {...field}
              id={field.name}
              legend="What do you want to request?"
              options={[
                { id: 'KWD', value: 'KWD', label: 'Key witness details' },
                { id: 'NKWD', value: 'NKWD', label: 'Non-key witness details' },
              ]}
              required
              error={errors?.requestType?.message as string}
              onChange={(option) => field.onChange(option.value)}
            />
          )}
        />

        <Controller
          name="defendantId"
          control={control}
          render={({ field }) => (
            <SelectList
              {...field}
              id={field.name}
              label="Select the defendant the action plan relates to"
              error={errors?.defendantId?.message as string}
              defaultValue={field?.value?.toString()}
              options={[
                { label: 'Defendant', value: '', id: '' },
                ...defendantSelectOptions,
                ...(defendantSelectOptions?.length > 1
                  ? [{ label: 'All defendants', value: 0, id: 0 }]
                  : []),
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="actionPlan"
          render={({ field }) => (
            <TextArea
              {...field}
              id={field.name}
              label="Describe the action plan"
              hint="Add details for the police about including a new witness."
              error={errors?.actionPlan?.message as string}
              defaultValue={field?.value?.toString() || ''}
              maxCharacters={2000}
            />
          )}
        />

        <Controller
          control={control}
          name="dateNeeded"
          render={({ field }) => (
            <TextInput
              {...field}
              type="date"
              id={field.name}
              hint="For example, 15/5/2024"
              label="Date needed"
              error={errors?.dateNeeded?.message as string}
              defaultValue={formatDateInputValue(field?.value)}
              width={10}
              min={formatDateInputValue(new Date())}
            />
          )}
        />

        <Controller
          name="followUp"
          control={control}
          render={({ field }) => (
            <Radios
              {...field}
              value={field.value !== undefined ? (field.value ? 'true' : 'false') : undefined}
              id={field.name}
              legend="Do you want to add a follow up?"
              options={[
                { id: 'true', value: 'true', label: 'Yes' },
                { id: 'false', value: 'false', label: 'No' },
              ]}
              required
              error={errors?.followUp?.message as string}
              onChange={(option) => field.onChange(option.value === 'true')}
              inline
            />
          )}
        />
        {followUp && (
          <div
            className="govuk-radios__conditional"
            style={{ marginTop: '-30px', marginBottom: '40px' }}
          >
            <Controller
              control={control}
              name="followUpDate"
              render={({ field }) => (
                <TextInput
                  {...field}
                  type="date"
                  id={field.name}
                  hint="For example, 15/5/2024"
                  label="What date do you want the follow up on?"
                  error={errors?.followUpDate?.message as string}
                  defaultValue={formatDateInputValue(field?.value)}
                  width={10}
                  min={dayjs().startOf('day').format('YYYY-MM-DD')}
                />
              )}
            />
          </div>
        )}

        <div className="govuk-button-group">
          <button type="submit" className="govuk-button" data-module="govuk-button">
            Continue
          </button>
          <Link to={URL.MATERIALS} className="govuk-link cancel-status-change">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
};
