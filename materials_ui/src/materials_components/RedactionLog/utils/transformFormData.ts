import { TLookupsResponse } from '../../../caseWorkApp/types/redaction';
import { RedactionLogData } from '../../../caseWorkApp/types/redactionLog';
import { TDocument } from '../../DocumentSelectAccordion/getters/getDocumentList';
import { RedactionLogFormInputs } from '../RedactionLogModal';

const normalize = (value: string | number | undefined | null): string =>
  value === undefined || value === null ? '' : value.toString().trim();

const findAreaAndUnit = (
  lookups: TLookupsResponse,
  areaId: string,
  unitId: string
) => {
  const normalizedAreaId = normalize(areaId);
  const normalizedUnitId = normalize(unitId);

  for (const area of lookups.areas || []) {
    if (
      normalize(area.id) === normalizedAreaId &&
      area.children?.some(
        (child) => normalize(child.id) === normalizedUnitId
      )
    ) {
      const unit = area.children?.find(
        (child) => normalize(child.id) === normalizedUnitId
      );
      return { area, unit };
    }
  }

  for (const division of lookups.divisions || []) {
    if (
      normalize(division.id) === normalizedAreaId &&
      division.children?.some(
        (child) => normalize(child.id) === normalizedUnitId
      )
    ) {
      const unit = division.children?.find(
        (child) => normalize(child.id) === normalizedUnitId
      );
      return { area: division, unit };
    }
  }

  return { area: null, unit: null };
};

const createRedactionsArray = (
  lookups: TLookupsResponse,
  underRedactionTypeIds: number[],
  overRedactionTypeIds: number[],
  overReason: 'investigative-agency' | 'cps-colleague' | null
): RedactionLogData['redactions'] => {
  const redactionsArray: RedactionLogData['redactions'] = [];
  const isReturnedToIA = overReason === 'investigative-agency';

  const findRedactionType = (typeId: number) =>
    lookups.missedRedactions?.find(
      (rt) => normalize(rt.id) === normalize(typeId)
    );

  // under redactions
  underRedactionTypeIds.forEach((typeId) => {
    const redactionType = findRedactionType(typeId);
    if (redactionType) {
      redactionsArray.push({
        missedRedaction: {
          id: redactionType.id,
          name: redactionType.name
        },
        redactionType: 1,
        returnedToInvestigativeAuthority: isReturnedToIA
      });
    }
  });

  // over redactions
  overRedactionTypeIds.forEach((typeId) => {
    const redactionType = findRedactionType(typeId);
    if (redactionType) {
      redactionsArray.push({
        missedRedaction: {
          id: redactionType.id,
          name: redactionType.name
        },
        redactionType: 2,
        returnedToInvestigativeAuthority: isReturnedToIA
      });
    }
  });

  return redactionsArray;
};

export const transformFormDataToApiFormat = (
  formData: RedactionLogFormInputs,
  urn: string,
  activeDocument: TDocument | null | undefined,
  lookups: TLookupsResponse | undefined
): RedactionLogData => {
  if (!lookups) {
    throw new Error('Lookups data is required for form transformation');
  }

  const { area, unit } = findAreaAndUnit(
    lookups,
    formData.areasAndDivisionsId,
    formData.businessUnitId
  );

  const investigatingAgency = lookups.investigatingAgencies?.find(
    (ia) => normalize(ia.id) === normalize(formData.investigatingAgencyId)
  );

  const documentType = lookups.documentTypes?.find(
    (dt) =>
      normalize(dt.cmsDocTypeId) &&
      normalize(dt.cmsDocTypeId) ===
      normalize(formData.documentTypeId)
  );

  const redactions = createRedactionsArray(
    lookups,
    formData.underRedactionTypeIds,
    formData.overRedactionTypeIds,
    formData.overReason
  );

  return {
    urn,
    unit: {
      id: unit?.id || formData.businessUnitId,
      type: 'Area',
      areaDivisionName: area?.name || '',
      name: unit?.name || ''
    },
    investigatingAgency: {
      id: investigatingAgency?.id || formData.investigatingAgencyId,
      name: investigatingAgency?.name || ''
    },
    documentType: {
      id:
        normalize(documentType?.cmsDocTypeId) ??
        normalize(formData.documentTypeId),
      name: documentType?.name || ''
    },
    redactions,
    notes: formData.supportingNotes,
    chargeStatus: formData.chargeStatus,
    cmsValues: {
      originalFileName: activeDocument?.cmsOriginalFileName || '',
      documentId: activeDocument?.documentId
        ? activeDocument.documentId.replace(/^CMS-/, '')
        : 0,
      documentType: documentType?.name || '',
      fileCreatedDate:
        activeDocument?.cmsFileCreatedDate || new Date().toISOString(),
      documentTypeId: parseInt(
        normalize(formData.documentTypeId) || '0',
        10
      )
    }
  };
};