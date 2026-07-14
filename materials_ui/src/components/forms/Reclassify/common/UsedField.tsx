import { Control, Controller, FieldErrors } from 'react-hook-form';

import { Radios } from '../../../Radios/Radios';
import { usedOptions } from '../constants/options';

type Props = { control: Control; errors?: FieldErrors };

export const UsedField = ({ control, errors }: Props) => {
  return (
    <Controller
      name="used"
      control={control}
      render={({ field }) => (
        <Radios
          {...field}
          value={field.value !== undefined ? (field.value ? 'true' : 'false') : undefined}
          id={field.name}
          legend="What is the material status?"
          options={usedOptions}
          required
          error={errors?.used?.message as string}
          onChange={(option) => field.onChange(option.value === 'true')}
        />
      )}
    />
  );
};
