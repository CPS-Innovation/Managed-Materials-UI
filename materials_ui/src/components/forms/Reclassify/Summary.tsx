import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { SummaryCard } from '../..';
import { URL } from '../../../constants/url';
import type { FormStep, ReclassifyFormData } from '../../../hooks';
import {
  useCaseDefendants,
  useCaseWitnesses,
  useDocumentTypes,
  useExhibitProducers,
} from '../../../hooks';
import type { Reclassify_ClassificationForm } from '../../../schemas/forms/reclassify';
import { formatDate } from '../../../utils/date';
import { mapBEClassificationToFE } from './constants/string';

type Props = {
  onChange?: (step: FormStep) => void;
  onSave: (data: ReclassifyFormData) => void;
  data: ReclassifyFormData;
};

export const Summary = ({ data, onChange, onSave }: Props) => {
  const { getDocumentTypeById } = useDocumentTypes();
  const { getWitnessById, formatWitnessName } = useCaseWitnesses();
  const { getDefendantById, formatDefendantName } = useCaseDefendants();
  const { getExhibitProducerById } = useExhibitProducers();

  console.log(data);

  const handleChangeClick = (step: FormStep) => {
    if (onChange) {
      onChange(step);
    }
  };

  const handleSaveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    onSave(data);
  };

  const documentType = getDocumentTypeById(data?.documentType as number);
  const usedStatus = data?.used ? 'Used' : 'Unused';
  const classification = mapBEClassificationToFE(
    data?.classification as Reclassify_ClassificationForm['classification'],
  );
  const witnessName =
    data?.classification === 'STATEMENT'
      ? formatWitnessName(getWitnessById(data?.witnessId as number))
      : null;
  const defendantName =
    data?.classification === 'STATEMENT'
      ? data?.witnessActionPlan?.defendantId === 0
        ? 'All defendants'
        : formatDefendantName(getDefendantById(data?.witnessActionPlan?.defendantId as number))
      : null;

  const exhibitProducer =
    data?.classification === 'EXHIBIT' ? getExhibitProducerById(data?.producerId) : false;

  return (
    <>
      <SummaryCard
        action={() => handleChangeClick('classification')}
        title="Classification"
        content={[
          {
            key: 'Type',
            value: (
              <>
                <strong>{classification}</strong>
                <br />
                {documentType?.name}
              </>
            ),
          },
        ]}
      />

      {data?.classification === 'STATEMENT' && (
        <>
          <SummaryCard
            action={() => handleChangeClick('classification')}
            title={`${documentType?.name} details`}
            content={[
              { key: 'Who is the Witness', value: witnessName || 'New witness (see below)' },
              {
                key: 'Does the statement have a date?',
                value: data?.hasStatementDate ? 'Yes' : 'No',
              },
              ...(data?.hasStatementDate
                ? [
                    {
                      key: 'What is the statement date?',
                      value: data?.statementDate ? formatDate(data?.statementDate) : '',
                    },
                  ]
                : []),
              { key: 'Statement number', value: data?.statementNumber as number },
              { key: 'What is the material status?', value: usedStatus },
            ]}
          />

          {data?.classification === 'STATEMENT' && data?.witnessId === 0 && (
            <SummaryCard
              action={() => handleChangeClick('addWitness')}
              title="New witness and action plan request"
              content={[
                { key: 'Name', value: data?.witnessActionPlan?.firstName },
                { key: 'Surname', value: data?.witnessActionPlan?.surname },
                { key: 'Contested issue', value: data?.witnessActionPlan?.actionPointText },
                {
                  key: 'What do you want to request',
                  value:
                    data?.witnessActionPlan?.requestType === 'KWD'
                      ? 'Key witness details'
                      : 'Non-key witness details',
                },
                { key: 'Select the defendant the action plan relates to', value: defendantName },
                { key: 'Describe the action plan', value: data?.witnessActionPlan?.actionPlan },
                { key: 'Date needed', value: formatDate(data?.witnessActionPlan?.dateNeeded) },
                {
                  key: 'Do you want to add a follow up?',
                  value: data?.witnessActionPlan?.followUp ? 'Yes' : 'No',
                },
                ...(data?.witnessActionPlan?.followUp
                  ? [
                      {
                        key: 'Follow up date',
                        value: formatDate(data?.witnessActionPlan?.followUpDate),
                      },
                    ]
                  : []),
              ]}
            />
          )}
        </>
      )}

      {data?.classification === 'EXHIBIT' && (
        <>
          <SummaryCard
            action={() => handleChangeClick('classification')}
            title={`${documentType?.name} details`}
            content={[
              { key: 'Item', value: data?.item },
              { key: 'Exhibit name', value: data?.subject },
              ...(data?.referenceNumber
                ? [{ key: 'Exhibit reference', value: data?.referenceNumber }]
                : []),
              ...(data?.producedBy || exhibitProducer
                ? [
                    {
                      key: 'Exhibit producer',
                      value: exhibitProducer ? exhibitProducer?.producer : data?.producedBy,
                    },
                  ]
                : []),
              { key: 'What is the material status?', value: usedStatus },
            ]}
          />
        </>
      )}

      {['MG Form', 'OTHER'].includes(data.classification as string) && (
        <SummaryCard
          action={() =>
            handleChangeClick(data.classification === 'STATEMENT' ? 'subject' : 'classification')
          }
          title={`${documentType?.name} details`}
          content={[
            { key: 'Material name', value: data?.subject },
            { key: 'What is the material status?', value: usedStatus },
          ]}
        />
      )}

      <div className="govuk-button-group">
        <button className="govuk-button" data-module="govuk-button" onClick={handleSaveClick}>
          Save
        </button>
        <Link to={URL.MATERIALS} className="govuk-link cancel-status-change">
          Cancel
        </Link>
      </div>
    </>
  );
};
