export type RedactionLogMappingData = {
  businessUnits: { ou: string; areaId: string | null; unitId: string | null }[];
  documentTypes: { cmsDocTypeId: string; docTypeId: string }[];
  investigatingAgencies: {
    ouCode: string;
    investigatingAgencyId: string | null;
  }[];
};

const MANUALLY_SELECT_DOCUMENT_TYPE_IDS = new Set([-1, 1029, 1200]);
const DEFENDANT_CATEGORY_DOCUMENT_TYPE_IDS = new Set([1056, 1057]);
const PNC_PRINT_DOCUMENT_TYPE_ID = '34';

export function getDocumentTypeValueFromMappings(
  documentTypeId: number,
  documentTypeMappings: RedactionLogMappingData | null
): string | undefined {
  const documentIsManuallySelected =
    MANUALLY_SELECT_DOCUMENT_TYPE_IDS.has(documentTypeId);

  const currentDocumentType = documentTypeMappings?.documentTypes.find(
    ({ cmsDocTypeId }) => cmsDocTypeId === `${documentTypeId}`
  );

  if (documentIsManuallySelected || !currentDocumentType?.docTypeId) {
    return;
  }

  if (DEFENDANT_CATEGORY_DOCUMENT_TYPE_IDS.has(documentTypeId)) {
    return PNC_PRINT_DOCUMENT_TYPE_ID;
  }

  return currentDocumentType.docTypeId;
}
