import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { Controller, FieldErrors, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ErrorSummary, LoadingSpinner, Radios } from '../components';
import DocumentPreview from '../components/DocumentPreview/DocumentPreview';
import type { ErrorSummaryItem } from '../components/ErrorSummary/ErrorSummary';
import { AddWitness, MaterialName, Summary } from '../components/forms/Reclassify';
import { categoryOptions } from '../components/forms/Reclassify/constants/options';
import { generateMaterialName } from '../components/forms/Reclassify/utils/form';
import {
  FormStep,
  ReclassifyFormData,
  useAppRoute,
  useBanner,
  useCaseLockCheck,
  useDocumentTypes,
  useExhibits,
  useReclassify,
  useReclassifyForm,
} from '../hooks';
import { CaseMaterialsType } from '../schemas';
import {
  Reclassify_ClassificationEnumType,
  Reclassify_ClassificationForm,
  Reclassify_ClassificationFormSchema,
  Reclassify_WitnessAndActionPlanType,
} from '../schemas/forms/reclassify';
import { useMaterialTags } from '../stores';
import { trackAction } from '../telemetry/appInsights';
import { formatDate } from '../utils/date';
import { getBannerData } from '../utils/reclassify';

export const ReclassificationPage = () => {
  const { getRoute } = useAppRoute();
  const { setTags } = useMaterialTags();
  const navigate = useNavigate();
  const { state } = useLocation();
  const material = state?.row as CaseMaterialsType;
  const { getDocumentTypeById } = useDocumentTypes();
  const { resetBanner, setBanner } = useBanner();
  const { compareRefs } = useExhibits();
  const { isLocked: isCaseLocked, name: caseLockName, refreshCaseLockStatus } = useCaseLockCheck();

  if (!material) {
    navigate(getRoute('MATERIALS'));
  }

  const { changeFormStep, currentStep, formData, saveFormData } = useReclassifyForm(material);

  const { loading: reclassifyLoading, submitReclassification } = useReclassify({
    materialId: material.materialId,
    onError: () => {
      setBanner({
        type: 'error',
        header: 'Reclassify unsuccessful',
        content: 'Unable to reclassify the material selected',
      });
    },
    onSuccess: (response) => {
      resetBanner('caselock');

      const isRenamed =
        formData.classification !== 'STATEMENT' &&
        material.subject.trim() !== formData?.subject?.trim();

      const banners = getBannerData(
        response?.data,
        formData?.classification as Reclassify_ClassificationEnumType,
        isRenamed,
      );

      banners.forEach((banner) => {
        setBanner(banner, true);
      });

      if (response.data.status !== 'Failed') {
        trackAction('Reclassified', {
          materialId: material.materialId?.toString(),
          category: material.category,
        });
        const documentType = getDocumentTypeById(fieldValues.documentType);
        const materialReclassifiedId =
          response?.data?.reclassificationResult?.resultData?.reclassifyCommunication?.id;

        setTags([{ materialId: materialReclassifiedId as number, tagName: 'Reclassified' }]);

        // if material reclassified to a communication, redirect to communication tab instead of materials
        navigate(
          documentType?.category === 'Communication'
            ? getRoute('COMMUNICATIONS')
            : getRoute('MATERIALS'),
          { state: { persistBanner: true } },
        );
      }
    },
  });

  const {
    clearErrors,
    control,
    formState: { errors: formErrors },
    handleSubmit,
    resetField,
    setError,
    setValue,
    watch,
  } = useForm<Reclassify_ClassificationForm>({
    // @ts-expect-error fix type here
    resolver: zodResolver(Reclassify_ClassificationFormSchema),
    defaultValues: formData,
  });

  const fieldValues = watch();

  // discriminated union does not have ability to customise error message
  // so we're doing it here in a slightly hacky way
  const errors = useMemo((): FieldErrors => {
    if (formErrors.classification) {
      formErrors.classification.message = 'Choose a new material classification category';
    }

    return formErrors;
  }, [formErrors]);

  // format react-hook-form error object into array to be rendered by ErrorSummary
  const errorSummary = Object.entries(errors).map(([key, entry]) => {
    return { id: key, message: entry?.message || '' };
  });

  const handleFormSubmit = (data: Reclassify_ClassificationForm) => {
    if (data?.classification === 'EXHIBIT') {
      if (compareRefs(data?.referenceNumber)) {
        setError('referenceNumber', {
          type: 'manual',
          message: `The reference number '${data?.referenceNumber}' has already been used`,
        });

        return;
      }
    }

    // no additional form steps for these classifications, head to the summary view
    if (['EXHIBIT', 'MG Form', 'OTHER'].includes(data?.classification as string)) {
      saveFormData(data);
      changeFormStep('summary');
    }

    if (data.classification === 'STATEMENT') {
      saveFormData(data);

      // if user has selected to add new witness, show add witness form
      if (data?.witnessId === 0) {
        saveFormData(data);
        changeFormStep('addWitness');
      } else {
        changeFormStep('summary');
      }
    } else {
      changeFormStep('summary');
    }
  };

  const handleMaterialNameFormSubmit = (data: Record<string, unknown>) => {
    saveFormData(data);
    changeFormStep('summary');
  };

  const handleAddWitnessAndActionPlanFormSubmit = (data: Reclassify_WitnessAndActionPlanType) => {
    if (formData?.classification === 'STATEMENT') {
      saveFormData({
        witnessActionPlan: data,
        subject: generateMaterialName(
          'MG11',
          (data?.firstName as string) || '',
          (data?.surname as string) || '',
          formatDate(formData?.statementDate, '-', 'DD-MM-YYYY'),
        ),
      });
    }

    changeFormStep('summary');
  };

  const handleSaveData = async (data: ReclassifyFormData) => {
    await submitReclassification(data);
  };

  const handleErrorsOnSubmit = () => {
    window.scrollTo(0, 0);
  };

  const renderBackLink = () => {
    if (currentStep !== 'classification') {
      let goToStep: FormStep;

      if (formData.classification === 'STATEMENT' && currentStep === 'subject') {
        if (formData?.witnessId === 0) {
          goToStep = 'addWitness';
        }
      }

      return (
        <a
          className="govuk-back-link"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            changeFormStep(goToStep || 'classification');
          }}
        >
          Back
        </a>
      );
    }
    return (
      <Link to={getRoute('MATERIALS')} className="govuk-back-link">
        Back
      </Link>
    );
  };

  useEffect(() => {
    resetBanner();
    window.scrollTo(0, 0);

    if (fieldValues.classification === 'STATEMENT') {
      if (
        fieldValues?.witnessId === 0 &&
        isCaseLocked &&
        (currentStep === 'addWitness' || currentStep === 'summary')
      ) {
        setBanner({
          type: 'error',
          header: `You cannot complete this action due to the case being in use by ${caseLockName}`,
          content: 'To unlock, please contact the user and ask them to exit the case',
          identifier: 'caselock',
        });
      } else {
        resetBanner('caselock');
      }
    }
  }, [currentStep, fieldValues.classification, isCaseLocked]);

  useEffect(() => {
    clearErrors();
    // if the user selects 'statement' classification, preselect MG11 document type
    if (fieldValues.classification === 'STATEMENT') {
      setValue('documentType', 1031);
    } else {
      resetField('documentType');
    }
  }, [fieldValues.classification]);

  useEffect(() => {
    // @ts-expect-error union type error, need to fix
    if (fieldValues?.hasStatementDate === false) {
      resetField('statementDate');
    }
    // @ts-expect-error union type error, need to fix
  }, [fieldValues?.hasStatementDate]);

  useEffect(() => {
    // @ts-expect-error union type error, need to fix
    if (fieldValues?.producerId) {
      clearErrors('producedBy');
    } else {
      clearErrors('producerId');
    }
    // @ts-expect-error union type error, need to fix
  }, [fieldValues?.producerId, fieldValues?.producedBy]);

  useEffect(() => {
    refreshCaseLockStatus();
  }, [currentStep]);

  return (
    <>
      <div>{renderBackLink()}</div>

      <div className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <ErrorSummary
              errorTitle="There was a problem"
              errorMessage={errorSummary as ErrorSummaryItem[]}
            />

            {currentStep === 'classification' && (
              <>
                <h2 className="govuk-caption-l hmrc-caption-l">
                  <span className="govuk-visually-hidden">This section is </span>
                  Reclassify
                </h2>
                <h1 className="govuk-heading-l">Material category</h1>

                <form
                  onSubmit={handleSubmit(
                    // @ts-expect-error need to fix type
                    handleFormSubmit,
                    handleErrorsOnSubmit,
                  )}
                  noValidate
                >
                  <Controller
                    name="classification"
                    control={control}
                    render={({ field }) => (
                      <Radios
                        {...field}
                        id={field.name}
                        legend="What is the new material classification category?"
                        options={categoryOptions(
                          // @ts-expect-error type error
                          control,
                          fieldValues,
                          errors,
                          material,
                        )}
                        required
                        error={errors?.classification?.message as string}
                        onChange={(option) => field.onChange(option.value)}
                      />
                    )}
                  />

                  <div className="govuk-button-group">
                    <button type="submit" className="govuk-button" data-module="govuk-button">
                      Continue
                    </button>
                    <Link to={getRoute('MATERIALS')} className="govuk-link cancel-status-change">
                      Cancel
                    </Link>
                  </div>
                </form>
              </>
            )}

            {formData.classification === 'STATEMENT' && currentStep === 'addWitness' && (
              <>
                <h2 className="govuk-caption-l hmrc-caption-l">
                  <span className="govuk-visually-hidden">This section is </span>
                  Reclassify
                </h2>
                <h1 className="govuk-heading-l">New witness and action plan request</h1>
                <AddWitness
                  data={formData?.witnessActionPlan as Reclassify_WitnessAndActionPlanType}
                  onSave={handleAddWitnessAndActionPlanFormSubmit}
                />
              </>
            )}

            {currentStep === 'subject' && (
              <MaterialName data={formData} onSave={handleMaterialNameFormSubmit} />
            )}

            {currentStep === 'summary' && (
              <>
                <LoadingSpinner isLoading={reclassifyLoading} textContent="Please wait..." />
                {!reclassifyLoading && (
                  <>
                    <h1 className="govuk-heading-l">Check your answers</h1>
                    <Summary
                      data={formData as ReclassifyFormData}
                      onChange={changeFormStep}
                      onSave={handleSaveData}
                    />
                  </>
                )}
              </>
            )}
          </div>

          <div className="govuk-grid-column-one-half">
            {material && <DocumentPreview row={material} />}
          </div>
        </div>
      </div>
    </>
  );
};
