import useSWR from 'swr';
import { useRequest } from '../';
import type { SelectOption } from '../../components/SelectList/SelectList';
import { QUERY_KEYS } from '../../constants/query';
import { DocumentType, DocumentTypeResponseType } from '../../schemas/documentTypes';
import { useCaseInfoStore } from '../../stores';

export const useDocumentTypes = () => {
  const { caseInfo } = useCaseInfoStore();
  const request = useRequest();

  const getDocumentTypes = async () =>
    await request
      .get<DocumentTypeResponseType>(`/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/document-types`)
      .then((response) => response.data);

  const { data: documentTypes, isLoading } = useSWR(
    caseInfo ? QUERY_KEYS.DOCUMENT_TYPES : null,
    getDocumentTypes,
  );

  const getDocumentTypeById = (documentId: number | string): DocumentType | undefined => {
    return documentTypes?.find((type) => type.id.toString() === documentId.toString());
  };

  // Step 1: Group by `group`
  const types = documentTypes?.reduce<Record<string, typeof documentTypes>>((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group]?.push(item);
    return acc;
  }, {});

  // Step 2: Sort each group by `name`
  for (const group in types) {
    types[group]?.sort((a, b) => a.name.localeCompare(b.name));
  }

  const selectOptions = (group: DocumentType['group']): SelectOption[] => {
    if (!types?.[group]) {
      return [];
    }

    return types[group].map((type) => ({ id: type.id, label: type.name, value: type.id }));
  };

  return { getDocumentTypeById, loading: isLoading, selectOptions, types };
};
