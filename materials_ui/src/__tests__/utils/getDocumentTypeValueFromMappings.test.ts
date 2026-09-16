import { describe, expect, it } from 'vitest';

import {
  getDocumentTypeValueFromMappings,
  type RedactionLogMappingData,
} from '../../materials_components/RedactionLog/utils/getDocumentTypeValueFromMappings';

const mappingsWith = (
  documentTypes: RedactionLogMappingData['documentTypes'],
): RedactionLogMappingData => ({ businessUnits: [], documentTypes, investigatingAgencies: [] });

describe('getDocumentTypeValueFromMappings', () => {
  it('returns the mapped redaction log document type for a mapped CMS document type', () => {
    const mappings = mappingsWith([
      { cmsDocTypeId: '101', docTypeId: '7' },
      { cmsDocTypeId: '202', docTypeId: '9' },
    ]);

    expect(getDocumentTypeValueFromMappings(202, mappings)).toBe('9');
  });

  it('returns undefined when the mappings have not loaded', () => {
    expect(getDocumentTypeValueFromMappings(101, null)).toBeUndefined();
  });

  it('returns undefined when the CMS document type has no mapping', () => {
    const mappings = mappingsWith([{ cmsDocTypeId: '101', docTypeId: '7' }]);

    expect(getDocumentTypeValueFromMappings(999, mappings)).toBeUndefined();
  });

  it.each([-1, 1029, 1200])(
    'returns undefined for manually-selected document type %i even when a mapping exists',
    (documentTypeId) => {
      const mappings = mappingsWith([{ cmsDocTypeId: `${documentTypeId}`, docTypeId: '7' }]);

      expect(getDocumentTypeValueFromMappings(documentTypeId, mappings)).toBeUndefined();
    },
  );

  it.each([1056, 1057])(
    'overrides the mapping with the PNC print type for defendant pre-cons document type %i',
    (documentTypeId) => {
      const mappings = mappingsWith([{ cmsDocTypeId: `${documentTypeId}`, docTypeId: '7' }]);

      expect(getDocumentTypeValueFromMappings(documentTypeId, mappings)).toBe('34');
    },
  );

  it('returns undefined for a defendant pre-cons document type with no mapping', () => {
    const mappings = mappingsWith([{ cmsDocTypeId: '101', docTypeId: '7' }]);

    expect(getDocumentTypeValueFromMappings(1056, mappings)).toBeUndefined();
  });
});
