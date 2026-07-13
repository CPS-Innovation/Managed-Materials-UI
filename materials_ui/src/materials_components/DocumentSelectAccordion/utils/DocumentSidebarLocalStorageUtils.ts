import z from 'zod';
import { safeJsonParse } from './generalUtils';

export const createDocumentSidebarReadDocIdsLocalStorageKey = (caseId: number) =>
  `documentSidebarReadDocIds-${caseId}`;

const schema = z.array(z.string());
export const safeGetDocumentSidebarReadDocIdsFromLocalStorage = (caseId: number): string[] => {
  const localStorageKey = createDocumentSidebarReadDocIdsLocalStorageKey(caseId);
  const readDocsJsonParsed = safeJsonParse(window.localStorage.getItem(localStorageKey));
  const readDocsSchemaParsed = schema.safeParse(readDocsJsonParsed.data);

  return readDocsSchemaParsed.success ? readDocsSchemaParsed.data : [];
};

export const safeSetDocumentSidebarReadDocIdsFromLocalStorage = (p: {
  caseId: number;
  newReadDocIds: string[];
}) => {
  const localStorageKey = createDocumentSidebarReadDocIdsLocalStorageKey(p.caseId);
  window.localStorage.setItem(localStorageKey, JSON.stringify(p.newReadDocIds));
};
