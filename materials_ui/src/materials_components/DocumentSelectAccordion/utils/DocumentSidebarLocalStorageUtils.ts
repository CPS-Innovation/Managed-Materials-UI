import z from 'zod';
import { safeJsonParse } from './generalUtils';

export const createDocumentSidebarReadDocIdsLocalStorageKey = (caseId: string | number) =>
  `documentSidebarReadDocIds-${caseId}`;

const schema = z.array(z.string());
export const safeGetDocumentSidebarReadDocIdsFromLocalStorage = (
  caseId: string | number,
): string[] => {
  const localStorageKey = createDocumentSidebarReadDocIdsLocalStorageKey(caseId);
  const readDocsJsonParsed = safeJsonParse(window.localStorage.getItem(localStorageKey));
  const readDocsSchemaParsed = schema.safeParse(readDocsJsonParsed.data);

  return readDocsSchemaParsed.success ? readDocsSchemaParsed.data : [];
};

export const safeSetDocumentSidebarReadDocIdsFromLocalStorage = (p: {
  caseId: string | number;
  newReadDocIds: string[];
}) => {
  const localStorageKey = createDocumentSidebarReadDocIdsLocalStorageKey(p.caseId);
  window.localStorage.setItem(localStorageKey, JSON.stringify(p.newReadDocIds));
};
