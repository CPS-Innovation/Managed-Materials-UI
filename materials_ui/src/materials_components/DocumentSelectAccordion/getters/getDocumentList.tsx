import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import z from 'zod';
import { useAxiosInstance } from './getAxiosInstance';

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DOCUMENT_LIST_RELOAD_ATTEMPTS = 3;
const DOCUMENT_LIST_RELOAD_RETRY_DELAY_MS = 400;
const safeGetDocumentListFromAxiosInstanceWithRetries = async (p: {
  attempts: number;
  retryDelayMs: number;
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  const {
    attempts = DOCUMENT_LIST_RELOAD_ATTEMPTS,
    retryDelayMs = DOCUMENT_LIST_RELOAD_RETRY_DELAY_MS,
  } = p;

  const errorMessages: string[] = [];
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const resp = await safeGetDocumentListFromAxiosInstance(p);

    if (resp.success) return resp;
    else errorMessages.push(resp.errorMessage);

    if (attempt < p.attempts) await delay(retryDelayMs);
  }

  return { success: false, errorMessages } as const;
};

export const documentSchema = z.object({
  parentId: z.string(),
  status: z.string(),
  cmsDocType: z.object({
    documentTypeId: z.number(),
    documentType: z.string().nullable(),
    documentCategory: z.string(),
  }),
  cmsOriginalFileName: z.string(),
  presentationTitle: z.string(),
  cmsFileCreatedDate: z.string(),
  isUnused: z.boolean(),
  hasNotes: z.boolean(),
  childId: z.number(),
  presentationFlags: z.object({ write: z.union([z.string(), z.boolean()]).nullish() }).nullish(),
});
export const documentListSchema = z.array(documentSchema);
export type TDocument = z.infer<typeof documentSchema>;
export type TDocumentList = TDocument[];

export const getDocumentListFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  const response = await p.axiosInstance.get(`/api/urns/${p.urn}/cases/${p.caseId}/documents`);

  return response.data;
};
export const getDocumentFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
  documentId: string | undefined;
  versionId: number | undefined;
}) => {
  const response = await p.axiosInstance.get(
    `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.versionId}`,
  );

  return response.data;
};

export const safeGetDocumentListFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string | undefined;
  caseId: number | undefined;
}): Promise<
  | { success: true; data: z.infer<typeof documentListSchema> }
  | { success: false; errorMessage: string }
> => {
  try {
    const resp = await getDocumentListFromAxiosInstance({
      urn: p.urn,
      caseId: p.caseId,
      axiosInstance: p.axiosInstance,
    });

    const parsedResp = documentListSchema.safeParse(resp);
    return parsedResp.success
      ? parsedResp
      : ({
          success: false,
          errorMessage: 'Unable to parse response in safeGetDocumentListFromAxiosInstance',
        } as const);
  } catch (error) {
    const errorSchema = z.object({ message: z.string() });
    const parsedError = errorSchema.safeParse(error);
    const errorMessage = !parsedError.success
      ? parsedError.error.message
      : 'Failed to fetch all the documents - in safeGetDocumentListFromAxiosInstance';

    return { success: false, errorMessage } as const;
  }
};

export const safeGetDocumentListFromLocalStorage = (p: {
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  try {
    const key = `documentList-${p.urn}-${p.caseId}`;
    const initResp = localStorage.getItem(key);
    const resp = JSON.parse(initResp!); // assert with !, any errors caught

    return documentListSchema.safeParse(resp);
  } catch (error) {
    const errorSchema = z.object({ message: z.string() });
    const parsedError = errorSchema.safeParse(error);
    const errorMessage = !parsedError.success
      ? parsedError.error.message
      : 'Failed to get valid documents from localStorage in safeGetDocumentListFromLocalStorage';
    return { success: false, errorMessage } as const;
  }
};

export const useGetDocumentList = (p: {
  populateOnMount: boolean;
  urn: string | undefined;
  caseId: number | undefined;
}) => {
  const axiosInstance = useAxiosInstance();

  const [documentListState, setDocumentListState] = useState<
    | { status: 'success'; data: TDocumentList }
    | { status: 'error'; errorMessages: string[] }
    | { status: 'loading' }
  >({ status: 'loading' });
  useEffect(() => {
    const key = `documentList-${p.urn}-${p.caseId}`;
    if (documentListState) localStorage.setItem(key, JSON.stringify(documentListState));
    if (documentListState === null) localStorage.removeItem(key);
  }, [documentListState]);

  const loadFromLocalStorage = () => {
    const resp = safeGetDocumentListFromLocalStorage({ urn: p.urn, caseId: p.caseId });

    if (resp.success) setDocumentListState({ status: 'success', data: resp.data });
  };

  const loadFromAxiosInstance = async () => {
    const resp = await safeGetDocumentListFromAxiosInstanceWithRetries({
      attempts: DOCUMENT_LIST_RELOAD_ATTEMPTS,
      retryDelayMs: DOCUMENT_LIST_RELOAD_RETRY_DELAY_MS,
      axiosInstance,
      urn: p.urn,
      caseId: p.caseId,
    });

    if (resp.success) return setDocumentListState({ status: 'success', data: resp.data });

    setDocumentListState({ status: 'error', errorMessages: resp.errorMessages });
  };

  const clear = () => setDocumentListState({ status: 'loading' });

  const load = async () => {
    loadFromLocalStorage();
    await loadFromAxiosInstance();
  };

  useEffect(() => {
    if (!p.populateOnMount) return;
    load();
  }, []);

  return { state: documentListState, load, clear };
};
