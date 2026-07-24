import type { ReclassifyFormData } from '../../../../hooks';
import type { Reclassify_Orchestrated_Request_Type } from '../../../../schemas/forms/reclassify';

export const mapReclassifyOther = (
  data: ReclassifyFormData,
  urn: string,
): Reclassify_Orchestrated_Request_Type => {
  if (data.classification !== 'OTHER') {
    throw new Error('Not a valid classification');
  }

  return {
    reclassification: {
      urn,
      classification: 'OTHER',
      documentTypeId: data?.documentType,
      subject: data?.subject,
      used: data?.used,
    },
  };
};
