import useSWRMutation from 'swr/mutation';

import {
  mapReclassifyExhibit,
  mapReclassifyMGForm,
  mapReclassifyOther,
  mapReclassifyStatement,
} from '../../components/forms/Reclassify/mappers';
import { SwrPayload } from '../../schemas';
import {
  Reclassify_ClassificationEnumType,
  Reclassify_Orchestrated_Request_Type,
  Reclassify_Orchestrated_Response_Type,
} from '../../schemas/forms/reclassify';
import { ReclassifyFormData } from './useReclassifyForm';

import { useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { useCaseInfoStore } from '../../stores';

const getDataMapper = (classification: Reclassify_ClassificationEnumType) => {
  switch (classification) {
    case 'OTHER':
      return mapReclassifyOther;
    case 'MG Form':
      return mapReclassifyMGForm;
    case 'EXHIBIT':
      return mapReclassifyExhibit;
    case 'STATEMENT':
      return mapReclassifyStatement;
    default:
      throw new Error('Unrecognised classification');
  }
};

export type UseReclassifyOptions = {
  materialId: number;
  onError?: (error: Error) => void;
  onSuccess?: (response: { data: Reclassify_Orchestrated_Response_Type }) => void;
};

export const useReclassify = ({ materialId, onError, onSuccess }: UseReclassifyOptions) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const postReclassification = async (
    _url: string,
    { arg: data }: SwrPayload<Reclassify_Orchestrated_Request_Type>,
  ) => {
    return await request.post<Reclassify_Orchestrated_Response_Type>(
      `/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${materialId}/reclassify-complete`,
      data,
    );
  };

  const { trigger: submitReclassify, isMutating: isReclassifyLoading } = useSWRMutation(
    QUERY_KEYS.RECLASSIFY_MATERIAL,
    postReclassification,
    { onError, onSuccess },
  );

  const submitReclassification = async (data: ReclassifyFormData) => {
    const mapper = getDataMapper(data?.classification);
    const statementData = mapper(data, caseInfo?.urn as string);

    await submitReclassify(statementData);
  };

  return { loading: isReclassifyLoading, submitReclassification };
};
