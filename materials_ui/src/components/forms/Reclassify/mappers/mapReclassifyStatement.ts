import dayjs from 'dayjs';

import type { ReclassifyFormData } from '../../../../hooks';
import {
  type Reclassify_Orchestrated_Request_Type,
  Reclassify_RequestTypeEnum,
} from '../../../../schemas/forms/reclassify';
import { formatDateInputValue } from '../../../../utils/date';

const dateFormat = 'YYYY-MM-DD';

export const mapReclassifyStatement = (
  data: ReclassifyFormData,
  urn: string,
): Reclassify_Orchestrated_Request_Type => {
  if (data.classification !== 'STATEMENT') {
    throw new Error('Not a valid classification');
  }

  const hasActionPlan = data?.witnessId === 0;

  const { witnessActionPlan } = data;
  const isAllDefendants = witnessActionPlan?.defendantId === 0;
  const fullDefendantName = !isAllDefendants
    ? `${witnessActionPlan?.surname.toUpperCase()}, ${witnessActionPlan?.firstName}`
    : null;

  const actionPlanData: Reclassify_Orchestrated_Request_Type['actionPlan'] = {
    urn,
    fullDefendantName,
    defendantId: witnessActionPlan?.defendantId,
    date: dayjs().format(dateFormat),
    dateExpected: witnessActionPlan?.dateNeeded
      ? dayjs(witnessActionPlan?.dateNeeded).format(dateFormat)
      : null,
    dateTimeCreated: dayjs().format(dateFormat),
    type: 'ModifyFileBuild',
    actionPointText: witnessActionPlan?.actionPointText || '',
    statusDescription: witnessActionPlan?.actionPlan || '',
    createdByOrganisation: 'CPS',
    steps: [
      ...(witnessActionPlan?.requestType === 'KWD'
        ? [
            {
              code: Reclassify_RequestTypeEnum.enum.KWD,
              description: 'Key Witness Details',
              text: '',
              hidden: false,
              hiddenDraft: false,
            },
          ]
        : [
            {
              code: Reclassify_RequestTypeEnum.enum.NKWD,
              description: 'Non-Key Witness Details',
              text: '',
              hidden: false,
              hiddenDraft: false,
            },
          ]),
    ],
  };

  const witness: Reclassify_Orchestrated_Request_Type['witness'] = {
    ...(data?.witnessId !== 0
      ? { witnessId: data?.witnessId }
      : {
          firstName: witnessActionPlan?.firstName || '',
          surname: witnessActionPlan?.surname || '',
        }),
  };

  return {
    reclassification: {
      urn,
      classification: 'STATEMENT',
      documentTypeId: data?.documentType,
      subject: data?.subject,
      used: data?.used,
      statement: {
        statementNo: data?.statementNumber,
        ...(data?.hasStatementDate ? { date: formatDateInputValue(data?.statementDate) } : {}),
      },
    },
    witness,
    ...(hasActionPlan ? { actionPlan: actionPlanData } : {}),
  };
};
