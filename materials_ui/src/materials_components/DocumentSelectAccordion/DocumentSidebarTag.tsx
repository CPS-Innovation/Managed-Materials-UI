import { GovUkTagTemplate, TTagStyleColor } from './templates/GovUkTagTemplate';

const documentSelectTagNameToTagPropMap = {
  ActiveDocument: { children: 'Active Document', color: 'blue' },
  NewVersion: { children: 'New Version', color: 'green' },
  New: { children: 'New', color: 'green' },
  Reclassified: { children: 'Reclassified', color: 'purple' },
  Updated: { children: 'Updated', color: 'orange' },
} satisfies { [key: string]: { children: string; color: TTagStyleColor } };

export type TDocumentSidebarTagName = keyof typeof documentSelectTagNameToTagPropMap;

export const DocumentSidebarTag = (p: { tagName: TDocumentSidebarTagName }) => {
  const props = documentSelectTagNameToTagPropMap[p.tagName];

  return <GovUkTagTemplate {...props} />;
};
