import { describe, expect, it } from 'vitest';

import type { TLookupsResponse } from '../../caseWorkApp/types/redaction';
import { ChargeStatusCode } from '../../constants/chargeStatus';
import type { TDocument } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import type { TRedactionType } from '../../materials_components/PdfRedactor/RedactionTypeSelect';
import type { RedactionLogFormInputs } from '../../materials_components/RedactionLog/RedactionLogModal';
import {
  LOOKUPS_REQUIRED_ERROR,
  transformFormDataToApiFormat,
} from '../../materials_components/RedactionLog/utils/transformFormData';

const URN = '45CD0303421';

const lookups = {
  areas: [
    { id: '3', name: 'CPS London North', children: [{ id: '12', name: 'Magistrates Unit' }] },
  ],
  divisions: [],
  documentTypes: [{ id: '34', cmsDocTypeId: '1056', name: 'MG11', children: [] }],
  investigatingAgencies: [{ id: '7', name: 'Metropolitan Police', children: [] }],
  missedRedactions: [
    { isDeletedPage: false, id: '1', name: 'Address', children: [] },
    { isDeletedPage: false, id: '2', name: 'Date of birth', children: [] },
  ],
  ouCodeMapping: [],
} as unknown as TLookupsResponse;

const activeDocument = {
  parentId: 'CMS-9876',
  cmsOriginalFileName: 'statement.pdf',
  cmsFileCreatedDate: '2026-01-15T00:00:00Z',
  cmsDocType: { documentTypeId: 1056, documentType: 'MG11', documentCategory: 'Statements' },
} as TDocument;

const aFormData = (overrides: Partial<RedactionLogFormInputs> = {}) =>
  ({
    underRedactionSelected: true,
    overRedactionSelected: false,
    underRedactionTypeIds: [],
    overRedactionTypeIds: [],
    areasAndDivisionsId: '3',
    businessUnitId: '12',
    investigatingAgencyId: '7',
    chargeStatus: ChargeStatusCode.PreCharge,
    documentTypeId: '34',
    category: 'under',
    overReason: null,
    redactionTypes: [],
    supportingNotes: 'Reviewed by supervisor',
    ...overrides,
  }) as RedactionLogFormInputs;

const transform = (
  overrides: Partial<Parameters<typeof transformFormDataToApiFormat>[0]> = {},
  formData: RedactionLogFormInputs = aFormData(),
) =>
  transformFormDataToApiFormat({
    formData,
    urn: URN,
    activeDocument,
    lookups,
    mode: 'over-under',
    listModeRedactionTypes: [],
    ...overrides,
  });

describe('transformFormDataToApiFormat', () => {
  it('refuses to build a log without lookups', () => {
    expect(() => transform({ lookups: undefined })).toThrow(LOOKUPS_REQUIRED_ERROR);
  });

  it('resolves the unit, agency and document type names from lookups', () => {
    const log = transform();

    expect(log.urn).toBe(URN);
    expect(log.unit).toEqual({
      id: '3-12',
      type: 'Area',
      areaDivisionName: 'CPS London North',
      name: 'Magistrates Unit',
    });
    expect(log.investigatingAgency).toEqual({ id: '7', name: 'Metropolitan Police' });
    expect(log.documentType).toEqual({ id: '34', name: 'MG11' });
    expect(log.notes).toBe('Reviewed by supervisor');
  });

  it('logs the CMS document id without its CMS- prefix', () => {
    expect(transform().cmsValues.documentId).toBe('9876');
  });

  it('falls back to the submitted ids when lookups hold no match', () => {
    const log = transform(
      {},
      aFormData({ areasAndDivisionsId: '99', businessUnitId: '98', investigatingAgencyId: '97' }),
    );

    expect(log.unit).toEqual({ id: '99-98', type: 'Area', areaDivisionName: '', name: '' });
    expect(log.investigatingAgency).toEqual({ id: '97', name: '' });
  });

  it('tags under redactions as type 1 and over redactions as type 2', () => {
    const log = transform(
      {},
      aFormData({
        underRedactionTypeIds: [1],
        overRedactionTypeIds: [2],
        overReason: 'investigative-agency',
      }),
    );

    expect(log.redactions).toEqual([
      {
        missedRedaction: { id: '1', name: 'Address' },
        redactionType: 1,
        returnedToInvestigativeAuthority: true,
      },
      {
        missedRedaction: { id: '2', name: 'Date of birth' },
        redactionType: 2,
        returnedToInvestigativeAuthority: true,
      },
    ]);
  });

  it('does not return to the investigating authority when a colleague over-redacted', () => {
    const log = transform(
      {},
      aFormData({ overRedactionTypeIds: [2], overReason: 'cps-colleague' }),
    );

    expect(log.redactions[0]!.returnedToInvestigativeAuthority).toBe(false);
  });

  it('logs the selected redaction types directly in list mode', () => {
    const listModeRedactionTypes = [
      { id: '1', name: 'Address' },
      { id: '2', name: 'Date of birth' },
    ] as unknown as TRedactionType[];

    const log = transform({ mode: 'list', listModeRedactionTypes });

    expect(log.redactions).toEqual([
      {
        missedRedaction: { id: '1', name: 'Address' },
        redactionType: 1,
        returnedToInvestigativeAuthority: false,
      },
      {
        missedRedaction: { id: '2', name: 'Date of birth' },
        redactionType: 1,
        returnedToInvestigativeAuthority: false,
      },
    ]);
  });
});
