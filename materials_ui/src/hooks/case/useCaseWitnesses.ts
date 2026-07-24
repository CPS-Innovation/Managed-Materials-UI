import useSWR from 'swr';

import { useRequest } from '../';
import type { SelectOption } from '../../components/SelectList/SelectList';
import { QUERY_KEYS } from '../../constants/query';
import type { WitnessListItemType, WitnessListResponseType } from '../../schemas/witness';
import { useCaseInfoStore } from '../../stores';

export const useCaseWitnesses = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getCaseWitnesses = async () =>
    await request
      .get<WitnessListResponseType>(`urns/${caseInfo?.urn}/cases/${caseInfo?.id}/case-witnesses`, {
        params: { caseId: caseInfo?.id },
      })
      .then((response) => response.data);

  const { data: caseWitnesses, isLoading } = useSWR(
    caseInfo ? QUERY_KEYS.CASE_WITNESSES : null,
    getCaseWitnesses,
  );

  const formatWitnessName = (witness?: WitnessListItemType | null): string => {
    if (!witness) {
      return '';
    }

    return `${witness?.firstName} ${witness?.surname}`;
  };
  const getWitnessById = (witnessId?: number | string): WitnessListItemType | null => {
    if (!witnessId) {
      return null;
    }

    const witness = caseWitnesses?.witnesses?.find(
      (witness) => witness.witnessId.toString() === witnessId?.toString(),
    );

    return witness || null;
  };

  const selectOptions: SelectOption[] =
    caseWitnesses?.witnesses?.map((witness) => ({
      id: witness?.witnessId,
      label: formatWitnessName(witness) || '',
      value: witness?.witnessId,
    })) || [];

  return {
    getWitnessById,
    loading: isLoading,
    data: caseWitnesses?.witnesses || [],
    selectOptions,
    formatWitnessName,
  };
};
