import useSWR from 'swr';
import { useAppRoute, useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { DocumentResultType } from '../../schemas/documents';

export const useDocuments = () => {
  const request = useRequest();
  const appRoute = useAppRoute();

  const urn = appRoute?.urnWithoutSlash;
  const caseId = appRoute?.caseId?.toString();

  const getDocuments = () =>
    request
      .get<DocumentResultType>(`/urns/${urn}/cases/${caseId}/documents`)
      .then((res) => res.data);

  const { data, isLoading } = useSWR<DocumentResultType>(
    urn && caseId ? [QUERY_KEYS.GET_ALL_DOCUMENTS, urn, caseId] : null,
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
