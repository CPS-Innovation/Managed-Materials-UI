import { Control, Controller, FieldErrors } from 'react-hook-form';

import { SelectList, TextInput } from '../..';
import { useExhibitProducers } from '../../../hooks';
import type { CaseMaterialsType } from '../../../schemas';
import { DocumentTypeField } from './common/DocumentTypeField';
import { SubjectField } from './common/SubjectField';
import { UsedField } from './common/UsedField';

type Props = {
  control: Control;
  data: Record<string, unknown>;
  errors?: FieldErrors;
  currentMaterial: CaseMaterialsType;
};

export const Exhibit = ({ control, data, errors, currentMaterial }: Props) => {
  const { selectOptions: exhibitProducerOptions, loading: isExhibitProducersLoading } =
    useExhibitProducers();

  return (
    <>
      <DocumentTypeField
        control={control}
        errors={errors}
        type="Exhibit"
        excludedTypeIds={[currentMaterial?.documentTypeId]}
      />

      <Controller
        name="item"
        control={control}
        render={({ field }) => (
          <TextInput
            {...field}
            id={field.name}
            label="Item"
            error={errors?.item?.message as string}
            defaultValue={field.value}
          />
        )}
      />

      <SubjectField control={control} errors={errors} label="Exhibit name (subject)" />

      <Controller
        control={control}
        name="referenceNumber"
        render={({ field }) => (
          <TextInput
            {...field}
            id={field.name}
            label="Exhibit reference"
            error={errors?.referenceNumber?.message as string}
            defaultValue={field.value}
            width={10}
          />
        )}
      />

      <Controller
        name="producerId"
        control={control}
        render={({ field }) => (
          <SelectList
            {...field}
            id={field.name}
            label="Exhibit producer or witness (optional)"
            error={errors?.producerId?.message as string}
            defaultValue={field?.value?.toString()}
            disabled={isExhibitProducersLoading || !!data?.producedBy}
            options={[
              ...(isExhibitProducersLoading
                ? [{ label: 'Loading...', value: '', id: '' }]
                : [{ label: 'Select producer or witness', value: '', id: '' }]),
              ...exhibitProducerOptions,
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
            disabled={!!data?.producerId}
          />
        )}
      />

      <UsedField control={control} errors={errors} />
    </>
  );
};
