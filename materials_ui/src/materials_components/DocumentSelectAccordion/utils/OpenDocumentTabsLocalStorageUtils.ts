import { z } from 'zod';
import { safeJsonParse } from './generalUtils';

const openTabsSchema = z.object({ openParentIds: z.array(z.string()), activeParentId: z.string() });

type OpenTabsState = z.infer<typeof openTabsSchema>;

export const createOpenDocumentTabsKey = (caseId: string | number) => `openDocumentTabs-${caseId}`;

export const safeGetOpenDocumentTabsFromLocalStorage = (
  caseId: string | number,
): OpenTabsState | null => {
  const key = createOpenDocumentTabsKey(caseId);
  const parsed = safeJsonParse(window.localStorage.getItem(key));
  const validated = openTabsSchema.safeParse(parsed.data);
  return validated.success ? validated.data : null;
};

export const safeSetOpenDocumentTabsFromLocalStorage = (p: {
  caseId: string | number;
  openParentIds: string[];
  activeParentId: string;
}) => {
  const key = createOpenDocumentTabsKey(p.caseId);
  window.localStorage.setItem(
    key,
    JSON.stringify({ openParentIds: p.openParentIds, activeParentId: p.activeParentId }),
  );
};

export const clearOpenDocumentTabsFromLocalStorage = (caseId: string | number) => {
  const key = createOpenDocumentTabsKey(caseId);
  window.localStorage.removeItem(key);
};
