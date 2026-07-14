import { Control, Controller, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { TextInput } from '../../..';

type Props<T extends FieldValues> = {
  control: Control<T>;
  errors?: FieldErrors<T>;
  label?: string;
  defaultValue?: string;
};

export const SubjectField = <T extends FieldValues>({
  control,
  defaultValue,
  errors,
  label,
}: Props<T>) => {
  return (
    <Controller
      control={control}
      name={'subject' as Path<T>}
      render={({ field }) => (
        <TextInput
          {...field}
          id={field.name}
          label={label || 'Material name'}
          error={errors?.subject?.message as string}
          defaultValue={field.value || defaultValue}
          required
          onChange={(value) => {
            field.onChange(value !== '' ? value : undefined);
          }}
        />
      )}
    />
  );
};
