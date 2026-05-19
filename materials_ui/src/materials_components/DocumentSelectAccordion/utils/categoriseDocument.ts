import z from 'zod';
import { SearchTermResultSchema } from '../../../schemas/documents';
import { documentSchema } from '../getters/getDocumentList';
import {
  documentTypeIdsMap,
  TCategoryName
} from './categoriseDocumentHelperUtils';

export const categoriseDocument = (
  doc: z.infer<typeof documentSchema> | z.infer<typeof SearchTermResultSchema>
): TCategoryName | null => {
  // this check needs to come before the others to ensure unused docs go
  // in this category even if their ID exists in another below
  if (
    doc.isUnused ||
    documentTypeIdsMap.unusedMaterial.includes(doc.cmsDocType.documentTypeId)
  ) {
    return 'unusedMaterial';
  }

  if (documentTypeIdsMap.statement.includes(doc.cmsDocType.documentTypeId)) {
    return 'statement';
  }

  if (documentTypeIdsMap.exhibit.includes(doc.cmsDocType.documentTypeId)) {
    return 'exhibit';
  }

  if (documentTypeIdsMap.mgForm.includes(doc.cmsDocType.documentTypeId)) {
    return 'mgForm';
  }

  if (
    documentTypeIdsMap.otherDocument.includes(doc.cmsDocType.documentTypeId)
  ) {
    return 'otherDocument';
  }

  if (documentTypeIdsMap.defendant.includes(doc.cmsDocType.documentTypeId)) {
    return 'defendant';
  }

  return null;
};
