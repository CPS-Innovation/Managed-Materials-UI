import useSWR from 'swr';
import { useAppRoute, useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { DocumentResultType } from '../../schemas/documents';

export const useDocuments = () => {
  const request = useRequest();
  const appRoute = useAppRoute();

  const caseId = appRoute?.caseId?.toString();

  const getDocuments = () =>
    request.get<DocumentResultType>(`/cases/${caseId}/documents`).then((res) => res.data);

  const { data, isLoading } = useSWR<DocumentResultType>(
    caseId ? [QUERY_KEYS.GET_ALL_DOCUMENTS, caseId] : null,
    getDocuments,
  );

  const docTypes = data
    ? Array.from(
        new Set(
          data.map((doc) => doc.cmsDocType.documentType).filter((t) => t != null && t !== ''),
        ),
      )
    : [];

  return { documents: data ?? null, loading: isLoading, docTypes };
};
