import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { DocumentPreview } from '../components';
import { EditExhibitForm } from '../components/forms/EditMaterial/EditExhibit';
import { EditStatementForm } from '../components/forms/EditMaterial/EditStatement';
import { Summary } from '../components/forms/EditMaterial/Summary';
import type { ContentItem } from '../components/SummaryCard/SummaryCard';
import { useAppRoute, useBanner, useCaseWitnesses, useEditMaterial } from '../hooks';
import type { CaseMaterialsType } from '../schemas';
import { EditExhibitType, EditStatementType } from '../schemas/forms/editStatement';
import { useMaterialTags } from '../stores';
import { trackAction } from '../telemetry/appInsights';

type EditMaterialLocationState = { returnTo: string; row: CaseMaterialsType };
type FormStep = 'form' | 'summary';

export const EditMaterialPage = () => {
  const { getRoute } = useAppRoute();
  const { setTags } = useMaterialTags();
  const { setBanner } = useBanner();
  const navigate = useNavigate();
  const [formStep, setFormStep] = useState<FormStep>('form');
  const [formData, setFormData] = useState<EditStatementType | EditExhibitType | null>(null);
  const { getWitnessById, formatWitnessName } = useCaseWitnesses();
  const location = useLocation();
  const { returnTo, row } = (location?.state || {}) as EditMaterialLocationState;
  const type = row?.category === 'Statement' ? 'Statement' : 'Exhibit';

  const { updateExhibit, updateStatement } = useEditMaterial({
    onError: () => {
      setBanner({ type: 'error', header: 'Unable to update material selected.' });
    },
    onSuccess: (response) => {
      trackAction('Updated', { materialId: row?.materialId?.toString(), category: row?.category });
      setTags([{ materialId: response?.materialId, tagName: 'Updated' }]);
      setBanner({ type: 'success', header: 'Success', content: `Material has been updated` }, true);

      navigate(returnTo, { state: { persistBanner: true } });
    },
  });

  const returnUrlPath = returnTo || getRoute('MATERIALS');

  const handleSubmitStatementSuccess = (data: EditStatementType) => {
    setFormData(data);
    setFormStep('summary');
  };

  const handleSubmitExhibitSuccess = (data: EditExhibitType) => {
    setFormData(data);
    setFormStep('summary');
  };

  const handleChangeClick = () => {
    setFormStep('form');
  };

  const handleSaveData = async () => {
    if (type === 'Statement') {
      await updateStatement(formData as EditStatementType);
    }

    if (type === 'Exhibit') {
      await updateExhibit(formData as EditExhibitType);
    }
  };

  const summaryCardData: { data: ContentItem[]; title: string } = useMemo(() => {
    if (type === 'Statement') {
      const statementData = formData as EditStatementType;

      const witness = getWitnessById(statementData?.witnessId);

      // statement data
      return {
        data: [
          { key: 'Who is the witness?', value: formatWitnessName(witness) },
          {
            key: 'Does the statement have a date?',
            value: statementData?.hasStatementDate ? 'Yes' : 'No',
          },
          ...(statementData?.hasStatementDate
            ? [
                {
                  key: 'What is the statement date?',
                  value: dayjs(statementData?.statementDate).format('D MMM YYYY'),
                },
              ]
            : []),
          { key: 'What is the statement number?', value: statementData?.statementNumber },
          { key: 'What is the material status?', value: statementData?.used ? 'Used' : 'Unused' },
        ],
        title: `Statement ${row?.type} details`,
      };
    }

    const exhibitData = formData as EditExhibitType;

    // exhibit data
    return {
      data: [
        { key: 'What is the exhibit reference number?', value: exhibitData?.reference },
        { key: 'What is the exhibit item?', value: exhibitData?.item },
        { key: 'What is the exhibit name?', value: exhibitData?.subject },

        ...(exhibitData?.existingproducerOrWitnessId || exhibitData?.producedBy
          ? [
              {
                key: 'Exhibit producer or witness',
                value: exhibitData?.existingproducerOrWitnessId
                  ? formatWitnessName(getWitnessById(exhibitData?.existingproducerOrWitnessId))
                  : exhibitData?.producedBy,
              },
            ]
          : []),
        { key: 'What is the material status?', value: exhibitData?.used ? 'Used' : 'Unused' },
      ],
      title: row?.type,
    };
  }, [formData, row]);

  const renderBackLink = () => {
    if (formStep === 'summary') {
      return (
        <a
          className="govuk-back-link"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setFormStep('form');
          }}
        >
          Back
        </a>
      );
    }

    return (
      <Link to={returnUrlPath} className="govuk-back-link">
        Back
      </Link>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [formStep]);

  return (
    <>
      <div>{renderBackLink()}</div>

      <div className="govuk-main-wrapper">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            {formStep === 'form' && (
              <>
                {type === 'Statement' && (
                  <EditStatementForm
                    cancelUrl={returnUrlPath}
                    formState={formData as EditStatementType}
                    material={row}
                    onSuccess={handleSubmitStatementSuccess}
                  />
                )}
                {type === 'Exhibit' && (
                  <EditExhibitForm
                    cancelUrl={returnUrlPath}
                    formState={formData as EditExhibitType}
                    material={row}
                    onSuccess={handleSubmitExhibitSuccess}
                  />
                )}
              </>
            )}

            {formStep === 'summary' && (
              <Summary
                onChange={handleChangeClick}
                onSave={handleSaveData}
                summaryCardData={summaryCardData.data}
                title={summaryCardData.title}
              />
            )}
          </div>
          <div className="govuk-grid-column-one-half">{row && <DocumentPreview row={row} />}</div>
        </div>
      </div>
    </>
  );
};
