import type { ReclassifyFormData } from '../../../../hooks';
import type { Reclassify_Orchestrated_Request_Type } from '../../../../schemas/forms/reclassify';
import { formatDateInputValue } from '../../../../utils/date';

export const mapReclassifyStatement = (
  data: ReclassifyFormData,
  urn: string,
): Reclassify_Orchestrated_Request_Type => {
  if (data.classification !== 'STATEMENT') {
    throw new Error('Not a valid classification');
  }

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
    witness: { witnessId: data?.witnessId },
  };
};
