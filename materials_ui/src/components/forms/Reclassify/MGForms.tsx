import { Control, FieldErrors } from 'react-hook-form';

import { CaseMaterialsType } from '../../../schemas';
import { DocumentTypeField } from './common/DocumentTypeField';
import { SubjectField } from './common/SubjectField';
import { UsedField } from './common/UsedField';

type Props = { control: Control; errors?: FieldErrors; currentMaterial: CaseMaterialsType };

export const MGForms = ({ control, errors, currentMaterial }: Props) => {
  return (
    <>
      <DocumentTypeField
        control={control}
        errors={errors}
        type="MG Form"
        excludedTypeIds={[currentMaterial?.documentTypeId]}
      />

      <SubjectField control={control} errors={errors} />

      <UsedField control={control} errors={errors} />
    </>
  );
};
