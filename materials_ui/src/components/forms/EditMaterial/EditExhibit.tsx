import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { useCaseWitnesses } from '../../../hooks/index.ts';
import {
  EditExhibitSchema,
  EditExhibitType
} from '../../../schemas/forms/editStatement.ts';
import { CaseMaterialsType } from '../../../schemas/index.ts';
import { SelectList } from '../../SelectList/SelectList.tsx';

import { TextInput } from '../../TextInput/TextInput.tsx';
import { SubjectField } from '../Reclassify/common/SubjectField.tsx';
import { UsedField } from '../Reclassify/common/UsedField.tsx';

type Props = {
  cancelUrl: string;
  formState: EditExhibitType | null;
  material: CaseMaterialsType;
  onSuccess: (data: EditExhibitType) => void;
};

export const EditExhibitForm = ({
  cancelUrl,
  formState,
  material,
  onSuccess
}: Props) => {
  const { selectOptions, loading: isWitnessesLoading } = useCaseWitnesses();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<EditExhibitType>({
    // @ts-expect-error fix type
    resolver: zodResolver(EditExhibitSchema),
    defaultValues: {
      materialId: formState?.materialId || material?.materialId,
      documentType: formState?.documentType || material?.documentTypeId,
      item: formState?.item || material?.item || '',
      reference: formState?.reference || material?.reference || '',
      subject: formState?.item || material?.subject || '',
      used: formState?.used || material?.status === 'Used',
      existingproducerOrWitnessId:
        formState?.existingproducerOrWitnessId ||
        material?.existingproducerOrWitnessId,
      producedBy:
        formState?.producedBy ||
        (!material?.existingproducerOrWitnessId
          ? material?.producer?.trim()
          : undefined)
    }
  });

  const fieldValues = watch();

  const handleFormSubmit = (data: EditExhibitType) => {
    onSuccess(data);
  };

  if (material?.category !== 'Exhibit') {
    return null;
  }

  return (
    <>
      <h2 className="govuk-caption-l hmrc-caption-l">
        <span className="govuk-visually-hidden">This section is </span>
        Update
      </h2>
      <h1 className="govuk-heading-l">Exhibit</h1>

      {/* @ts-expect-error fix type */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Controller
          control={control}
          name="reference"
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              label="What is the exhibit reference number?"
              error={errors?.reference?.message as string}
              defaultValue={field.value}
            />
          )}
        />

        <Controller
          name="item"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              label="What is the exhibit item?"
              error={errors?.item?.message as string}
              defaultValue={field.value}
            />
          )}
        />

        <SubjectField<EditExhibitType>
          control={control as any}
          errors={errors}
          label="What is the exhibit name?"
          defaultValue={fieldValues.subject}
        />

        <Controller
          name="existingproducerOrWitnessId"
          control={control}
          render={({ field }) => (
            <SelectList
              {...field}
              onChange={(value) => {
                field.onChange(value === '' ? undefined : +value);
              }}
              id={field.name}
              label="Exhibit producer or witness (optional)"
              error={errors?.existingproducerOrWitnessId?.message as string}
              disabled={isWitnessesLoading}
              options={[
                {
                  label: isWitnessesLoading
                    ? 'Loading...'
                    : 'Select producer or witness',
                  value: '',
                  id: ''
                },
                ...selectOptions
              ]}
            />
          )}
        />

        <Controller
          control={control}
          name="producedBy"
          render={({ field }) => (
            <TextInput
              {...field}
              id={field.name}
              label="Produced by (optional)"
              error={errors?.producedBy?.message as string}
              defaultValue={field.value}
              disabled={!!fieldValues.existingproducerOrWitnessId}
            />
          )}
        />

        {/* @ts-expect-error fix control type */}
        <UsedField control={control} errors={errors} />

        <div className="govuk-button-group">
          <button
            type="submit"
            className="govuk-button"
            data-module="govuk-button"
          >
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
