import { useMemo } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { SelectList } from '../../..';
import { useDocumentTypes } from '../../../../hooks';
import { DocumentType } from '../../../../schemas/documentTypes';

type Props = {
  control: Control;
  errors?: FieldErrors;
  type: DocumentType['group'];
  excludedTypeIds: (string | number)[];
};

export const DocumentTypeField = ({ control, errors, type, excludedTypeIds = [] }: Props) => {
  const { selectOptions } = useDocumentTypes();

  const filteredOptions = useMemo(
    () =>
      selectOptions(type).map((option) => ({
        ...option,
        disabled: excludedTypeIds?.includes(option?.id),
      })),
    [excludedTypeIds, selectOptions, type],
  );

  return (
    <Controller
      name="documentType"
      control={control}
      render={({ field }) => (
        <SelectList
          {...field}
          id={field.name}
          label="What is the material classification type?"
          error={errors?.documentType?.message as string}
          defaultValue={field?.value?.toString()}
          options={[{ label: 'Select type', value: '', id: '' }, ...filteredOptions]}
          onChange={(value) => {
            field.onChange(value || undefined);
          }}
        />
      )}
    />
  );
};
