import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DISCARD_MATERIAL_OPTIONS } from '../constants';

import { Layout, LoadingSpinner, RadioOption, Radios } from '../components';
import { URL } from '../constants/url';
import { useAppRoute, useBanner, useCaseMaterials, useDiscard } from '../hooks';
import { trackAction } from '../telemetry/appInsights';

export const DiscardMaterialPage = () => {
  const { getRoute } = useAppRoute();
  const [reason, setReason] = useState<RadioOption | undefined>();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { state } = useLocation();
  const { setBanner } = useBanner();
  const { mutate: refreshCaseMaterials } = useCaseMaterials({
    dataType: 'materials'
  });

  const material = state?.selectedMaterial;

  const returnTo = state?.returnTo || URL.MATERIALS;
  // const fullReturnUrl = `${returnTo}?material=${material?.id}`;

  const { isLoading: isDiscarding, trigger } = useDiscard(material, {
    onSuccess: async () => {
      trackAction('Discarded', {
        materialId: material?.materialId,
        category: material?.category
      });
      setError('');

      navigate(returnTo, { state: { persistBanner: true } });

      await refreshCaseMaterials();

      setBanner({
        type: 'success',
        header: 'Discard successful',
        content: `${material?.subject} has been discarded.`
      });
    },
    onError: async () => {
      let errorMessage = '';

      errorMessage = `Unable to discard ${material?.subject}. Please try again.`;
      setError(errorMessage);
      setBanner({
        type: 'error',
        header: 'Discard unsuccessful',
        content: errorMessage
      });

      navigate(returnTo, { state: { persistBanner: true } });
    }
  });

  useEffect(() => {
    if (!material) {
      navigate(getRoute('MATERIALS'));
    }
  }, []);

  const handleRadioChange = (option: RadioOption) => {
    setReason(option);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason) {
      setError('You must select a reason for discarding the material');
    } else {
      await trigger({
        materialId: material?.materialId,
        discardReason: reason.value as string,
        discardReasonDescription: reason.label
      });
    }
  };

  return (
    <>
      <LoadingSpinner isLoading={isDiscarding} />
      {!isDiscarding && (
        <Layout plain title="Discard Material">
          <Link
            to={returnTo}
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            className="govuk-back-link"
          >
            Back
          </Link>

          <div className="govuk-main-wrapper">
            <h2 className="govuk-caption-l hmrc-caption-l">
              <span className="govuk-visually-hidden">This section is </span>
              Discard material
            </h2>
            <h1 className="govuk-heading-l">Reason for discarding material</h1>

            <form onSubmit={handleSubmit}>
              <Radios
                error={error}
                legend="Select a reason for discarding material"
                name="reason"
                onChange={handleRadioChange}
                options={DISCARD_MATERIAL_OPTIONS.map((option) => ({
                  ...option,
                  id: option.value
                }))}
                value={reason?.value as string}
                required
              />

              <div className="govuk-button-group">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                  onClick={() => null}
                  data-testid="saveChangesButton"
                >
                  Save and discard
                </button>
                <Link to={returnTo} className="govuk-link cancel-status-change">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </Layout>
      )}
    </>
  );
};
