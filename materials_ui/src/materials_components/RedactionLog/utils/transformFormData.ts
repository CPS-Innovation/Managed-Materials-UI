import { TLookupsResponse } from '../../../caseWorkApp/types/redaction';
import { RedactionLogData } from '../../../caseWorkApp/types/redactionLog';
import { TDocument } from '../../DocumentSelectAccordion/getters/getDocumentList';
import { TRedactionType } from '../../PdfRedactor/PdfRedactionTypeForm';
import { RedactionLogFormInputs } from '../RedactionLogModal';

const normalizeToString = (
  value: string | number | undefined | null
): string =>
  value === undefined || value === null ? '' : value.toString().trim();

const findAreaAndUnit = (
  lookups: TLookupsResponse,
  areaId: string,
  unitId: string
) => {
  const trimmedAreaId = normalizeToString(areaId);
  const trimmedUnitId = normalizeToString(unitId);

  for (const area of lookups.areas || []) {
    if (
      normalizeToString(area.id) === trimmedAreaId &&
      area.children?.some(
        (child) => normalizeToString(child.id) === trimmedUnitId
      )
    ) {
      const unit = area.children?.find(
        (child) => normalizeToString(child.id) === trimmedUnitId
      );
      return { area, unit };
    }
  }

  for (const division of lookups.divisions || []) {
    if (
      normalizeToString(division.id) === trimmedAreaId &&
      division.children?.some(
        (child) => normalizeToString(child.id) === trimmedUnitId
      )
    ) {
      const unit = division.children?.find(
        (child) => normalizeToString(child.id) === trimmedUnitId
      );
      return { area: division, unit };
    }
  }

  return { area: null, unit: null };
};

const createOverUnderModeRedactions = (
  lookups: TLookupsResponse,
  underRedactionTypeIds: number[],
  overRedactionTypeIds: number[],
  overReason: 'investigative-agency' | 'cps-colleague' | null
): RedactionLogData['redactions'] => {
  const redactionsArray: RedactionLogData['redactions'] = [];
  const isReturnedToIA = overReason === 'investigative-agency';

  const findRedactionType = (typeId: number) =>
    lookups.missedRedactions?.find(
      (rt) => normalizeToString(rt.id) === normalizeToString(typeId)
    );

  // under redactions
  underRedactionTypeIds.forEach((typeId) => {
    const redactionType = findRedactionType(typeId);
    if (redactionType) {
      redactionsArray.push({
        missedRedaction: { id: redactionType.id, name: redactionType.name },
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
        missedRedaction: { id: redactionType.id, name: redactionType.name },
        redactionType: 2,
        returnedToInvestigativeAuthority: isReturnedToIA
      });
    }
  });

  return redactionsArray;
};

const createListModeRedactions = (
  types: TRedactionType[]
): RedactionLogData['redactions'] =>
  types.map(({ id, name }) => ({
    missedRedaction: { id, name },
    redactionType: 1,
    returnedToInvestigativeAuthority: false
  }));

type TransformFormDataToApiFormatParams = {
  formData: RedactionLogFormInputs;
  urn: string;
  activeDocument: TDocument | null | undefined;
  lookups: TLookupsResponse | undefined;
  mode: 'over-under' | 'list';
  listModeRedactionTypes: TRedactionType[];
};

export const transformFormDataToApiFormat = ({
  formData,
  urn,
  activeDocument,
  lookups,
  mode,
  listModeRedactionTypes
}: TransformFormDataToApiFormatParams): RedactionLogData => {
  if (!lookups) {
    throw new Error('Lookups data is required for form transformation');
  }

  const { area, unit } = findAreaAndUnit(
    lookups,
    formData.areasAndDivisionsId,
    formData.businessUnitId
  );

  const investigatingAgency = lookups.investigatingAgencies?.find(
    (ia) =>
      normalizeToString(ia.id) ===
      normalizeToString(formData.investigatingAgencyId)
  );

  const documentType = lookups.documentTypes?.find(
    (dt) =>
      normalizeToString(dt.id) &&
      normalizeToString(dt.id) === normalizeToString(formData.documentTypeId)
  );

  const redactions =
    mode === 'list'
      ? createListModeRedactions(listModeRedactionTypes)
      : createOverUnderModeRedactions(
          lookups,
          formData.underRedactionTypeIds,
          formData.overRedactionTypeIds,
          formData.overReason
        );

  return {
    urn,
    unit: {
      id:
        area && unit
          ? `${area.id}-${unit.id}`
          : `${formData.areasAndDivisionsId}-${formData.businessUnitId}`,
      type: 'Area',
      areaDivisionName: area?.name || '',
      name: unit?.name || ''
    },
    investigatingAgency: {
      id: investigatingAgency?.id || formData.investigatingAgencyId,
      name: investigatingAgency?.name || ''
    },
    documentType: {
      id: documentType?.id || normalizeToString(formData.documentTypeId),
      name: documentType?.name || ''
    },
    redactions,
    notes: formData.supportingNotes,
    chargeStatus: formData.chargeStatus,
    cmsValues: {
      originalFileName: activeDocument?.cmsOriginalFileName || '',
      documentId: activeDocument?.parentId
        ? activeDocument.parentId.replace(/^CMS-/, '')
        : 0,
      documentType: activeDocument?.cmsDocType.documentType || '',
      fileCreatedDate:
        activeDocument?.cmsFileCreatedDate || new Date().toISOString(),
      documentTypeId: activeDocument?.cmsDocType.documentTypeId || 0
    }
  };
};
