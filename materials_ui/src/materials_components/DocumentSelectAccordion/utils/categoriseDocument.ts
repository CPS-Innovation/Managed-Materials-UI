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
  const id = doc.cmsDocType.documentTypeId;

  if (doc.isUnused) {
    return 'unusedMaterial';
  }

  for (const category of Object.keys(documentTypeIdsMap) as TCategoryName[]) {
    if (documentTypeIdsMap[category].includes(id)) {
      return category;
    }
  }

  return null;
};
