import type { ReclassifyFormData } from '../../../../hooks';
import type { Reclassify_Orchestrated_Request_Type } from '../../../../schemas/forms/reclassify';

export const mapReclassifyExhibit = (
  data: ReclassifyFormData,
  urn: string,
): Reclassify_Orchestrated_Request_Type => {
  if (data.classification !== 'EXHIBIT') {
    throw new Error('Not a valid classification');
  }

  return {
    reclassification: {
      urn,
      classification: 'EXHIBIT',
      documentTypeId: data?.documentType,
      subject: data?.subject,
      used: data?.used,
      exhibit: {
        item: data?.item,
        reference: data?.referenceNumber,
        ...(data?.producerId ? { existingproducerOrWitnessId: data?.producerId as number } : {}),
        ...(data?.producedBy ? { Producer: data?.producedBy, newProducer: data?.producedBy } : {}),
      },
    },
  };
};
