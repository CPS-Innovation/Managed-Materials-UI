import { Control, FieldErrors } from 'react-hook-form';

import { Exhibit, MGForms, Other, Statement } from '..';
import type { ReclassifyFormData } from '../../../../hooks';
import { CaseMaterialsType } from '../../../../schemas';
import type { RadioOption } from '../../../Radios/Radios';

export const categoryOptions = (
  control: Control,
  data: Record<string, unknown>,
  errors: FieldErrors,
  caseMaterial: CaseMaterialsType,
): RadioOption[] => [
  {
    label: 'Statement (MG11)',
    value: 'STATEMENT',
    id: 'statement',
    // prevent user trying to reclassify a statement to a statement
    disabled: caseMaterial.category === 'Statement',
    conditionalField: (
      <Statement control={control} errors={errors} data={data as ReclassifyFormData} />
    ),
  },
  {
    label: 'Exhibit',
    value: 'EXHIBIT',
    id: 'exhibit',
    conditionalField: (
      <Exhibit control={control} data={data} errors={errors} currentMaterial={caseMaterial} />
    ),
  },
  {
    label: 'MG Forms',
    value: 'MG Form',
    id: 'mgForm',
    conditionalField: <MGForms control={control} errors={errors} currentMaterial={caseMaterial} />,
  },
  {
    label: 'Other',
    value: 'OTHER',
    id: 'other',
    conditionalField: <Other control={control} errors={errors} currentMaterial={caseMaterial} />,
  },
];

export const usedOptions: RadioOption[] = [
  { label: 'Used', value: 'true', id: 'used' },
  { label: 'Unused', value: 'false', id: 'unused' },
];
