import { Reclassify_ClassificationForm } from '../../../../schemas/forms/reclassify';

const BE_TO_FE_CLASSIFICATIONS_MAP: Record<
  Reclassify_ClassificationForm['classification'],
  string
> = { STATEMENT: 'Statement', EXHIBIT: 'Exhibit', 'MG Form': 'MG Forms', OTHER: 'Other' };

export const mapBEClassificationToFE = (
  classification: Reclassify_ClassificationForm['classification'],
) => {
  return BE_TO_FE_CLASSIFICATIONS_MAP[classification];
};
