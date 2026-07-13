import useSWR from 'swr';

import { useRequest } from '../';
import type { SelectOption } from '../../components/SelectList/SelectList';
import { QUERY_KEYS } from '../../constants/query';
import { DefendantsResponseType, DefendantType } from '../../schemas/defendants';
import { useCaseInfoStore } from '../../stores';

export const useCaseDefendants = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getCaseDefendants = async () =>
    await request
      .get<DefendantsResponseType>(`/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/case-defendants`, {
        params: { caseId: caseInfo?.id },
      })
      .then((response) => response.data);

  const { data: caseDefendants, isLoading } = useSWR(
    caseInfo?.id ? QUERY_KEYS.CASE_DEFENDANTS : null,
    getCaseDefendants,
  );

  const formatDefendantName = (defendant?: DefendantType | null): string => {
    if (!defendant) {
      return '';
    }

    return `${defendant?.firstNames} ${defendant?.surname}`;
  };

  const getDefendantById = (defendantId?: number | string): DefendantType | null => {
    if (!defendantId) {
      return null;
    }

    const defendant = caseDefendants?.defendants?.find(
      (def) => def.id.toString() === defendantId?.toString(),
    );

    return defendant || null;
  };

  const selectOptions: SelectOption[] =
    caseDefendants?.defendants?.map((defendant) => ({
      id: defendant?.id,
      label: formatDefendantName(defendant) || '',
      value: defendant?.id,
    })) || [];

  return {
    data: caseDefendants?.defendants || [],
    loading: isLoading,
    getDefendantById,
    formatDefendantName,
    selectOptions,
  };
};
