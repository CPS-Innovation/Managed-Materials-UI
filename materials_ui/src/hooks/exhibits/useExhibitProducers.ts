import useSWR from 'swr';

import { useRequest } from '../';
import type { SelectOption } from '../../components/SelectList/SelectList';
import { QUERY_KEYS } from '../../constants/query';
import { ExhibitProducerResponseType, ExhibitProducerType } from '../../schemas/exhibitProducer';
import { useCaseInfoStore } from '../../stores';

export const useExhibitProducers = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const getExhibitProducers = async () =>
    await request
      .get<ExhibitProducerResponseType>(
        `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/case-exhibit-producers`,
      )
      .then((response) => response.data);

  const { data, isLoading, isValidating } = useSWR(
    caseInfo ? QUERY_KEYS.EXHIBIT_PRODUCERS : null,
    getExhibitProducers,
  );

  const selectOptions: SelectOption[] =
    data?.exhibitProducers?.map((item) => ({
      id: item?.id,
      label: item.producer,
      value: item?.id,
    })) || [];

  const getExhibitProducerById = (id?: number | string): ExhibitProducerType | null => {
    if (!id) {
      return null;
    }

    const producer = data?.exhibitProducers?.find((item) => item.id.toString() === id?.toString());

    return producer || null;
  };

  return {
    data: data?.exhibitProducers || [],
    getExhibitProducerById,
    loading: isLoading || isValidating,
    selectOptions,
  };
};
