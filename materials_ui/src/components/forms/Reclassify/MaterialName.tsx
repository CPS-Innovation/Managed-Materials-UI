import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { ErrorSummary } from '../..';
import { URL } from '../../../constants/url';
import {
  Reclassify_MaterialNameFormSchema,
  Reclassify_MaterialNameFormType,
} from '../../../schemas/forms/reclassify';
import type { ErrorSummaryItem } from '../../ErrorSummary/ErrorSummary';
import { SubjectField } from './common/SubjectField';

type Props = { data: Record<string, unknown>; onSave: (data: Record<string, unknown>) => void };

export const MaterialName = ({ data, onSave }: Props) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<Reclassify_MaterialNameFormType>({
    defaultValues: data,
    resolver: zodResolver(Reclassify_MaterialNameFormSchema),
  });

  // format react-hook-form error object into array to be rendered by ErrorSummary
  const errorSummary = Object.entries(errors).map(([key, entry]) => {
    return { id: key, message: entry?.message || '' };
  });

  const handleFormData = (data: Record<string, unknown>) => {
    onSave(data);
  };

  return (
    <>
      <ErrorSummary
        errorTitle="There was a problem"
        errorMessage={errorSummary as ErrorSummaryItem[]}
      />

      <form onSubmit={handleSubmit(handleFormData)} noValidate>
        <h2 className="govuk-caption-l hmrc-caption-l">
          <span className="govuk-visually-hidden">This section is </span>
          Reclassify
        </h2>
        <h1 className="govuk-heading-l">Material name</h1>

        <SubjectField control={control} errors={errors} />

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
