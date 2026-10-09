import { AxiosInstance } from 'axios';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import z from 'zod';
import { useAxiosInstance } from './getAxiosInstance';

const documentNoteSchema = z.object({
  createdByName: z.string(),
  date: z.string(),
  text: z.string(),
});
const documentNotesSchema = z.array(documentNoteSchema);

export type TDocumentNote = z.infer<typeof documentNoteSchema>;
export type TDocumentNotes = z.infer<typeof documentNotesSchema>;

export const postDocumentNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  documentId: string | undefined;
  caseId: string | number | undefined;
  text: string;
}) => {
  const response = await p.axiosInstance.post(
    `/cases/${p.caseId}/documents/${p.documentId}/notes`,
    { Text: p.text },
  );

  return response.data;
};

export const getDocumentNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  documentId: string | undefined;
  caseId: string | number | undefined;
}) => {
  const response = await p.axiosInstance.get(`/cases/${p.caseId}/materials/${p.documentId}/notes`);

  return response.data;
};

export const safeGetDocumentNotesFromLocalStorage = (p: {
  caseId: string | number | undefined;
  documentId: string | undefined;
}) => {
  try {
    const key = createGetDocumentNotesKey(p);
    const initResp = localStorage.getItem(key);
    const resp = JSON.parse(initResp!); // assert with !, any errors caught

    return documentNotesSchema.safeParse(resp);
  } catch (_error) {
    return { success: false } as const;
  }
};

const createGetDocumentNotesKey = (p: {
  documentId: string | undefined;
  caseId: string | number | undefined;
}) => `getDocumentNotes-${p.caseId}-${p.documentId}`;

export const safeGetDocumentNotesFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  documentId: string | undefined;
  caseId: string | number | undefined;
}) => {
  try {
    const resp = await getDocumentNotesFromAxiosInstance({
      caseId: p.caseId,
      documentId: p.documentId,
      axiosInstance: p.axiosInstance,
    });

    return documentNotesSchema.safeParse(resp);
  } catch (_error) {
    return { success: false } as const;
  }
};

export const safeSetDocumentNotesFromLocalStorage = (p: {
  documentId: string | undefined;
  caseId: string | number | undefined;
  data: TDocumentNotes | null | undefined;
}) => {
  const localStorageKey = createGetDocumentNotesKey({ documentId: p.documentId, caseId: p.caseId });
  window.localStorage.setItem(localStorageKey, JSON.stringify(p.data));
};

export const useGetDocumentNotes = (p: {
  caseId: string | number | undefined;
  documentId: string | undefined;
  revalidateOnMount?: boolean;
}) => {
  const { revalidateOnMount = true } = p;
  const axiosInstance = useAxiosInstance();
  const key = createGetDocumentNotesKey(p);

  const fallbackData = useMemo(() => {
    const resp = safeGetDocumentNotesFromLocalStorage(p);
    return resp.success ? resp.data : undefined;
  }, [p.caseId, p.documentId]);

  const rtn = useSWR(
    key,
    async () => {
      const resp = await safeGetDocumentNotesFromAxiosInstance({ ...p, axiosInstance });
      return resp.success ? resp.data : null;
    },
    { fallbackData, revalidateOnMount },
  );

  useEffect(() => {
    safeSetDocumentNotesFromLocalStorage({ ...p, data: rtn.data });
  }, [rtn.data]);
  return rtn;
};
