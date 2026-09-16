import { QUERY_KEYS } from '../../constants/query';
import { SwrPayload } from '../../schemas';
import {
  CaseMaterialReadStatusRequestType,
  CaseMaterialReadStatusResponseType,
} from '../../schemas/caseMaterials';

import useSWRMutation from 'swr/mutation';
import { useLogger, useRequest } from '..';
import { useCaseInfoStore } from '../../stores';

export const useReadStatus = () => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();
  const { log } = useLogger();

  const updateReadStatus = async (
    _url: string,
    { arg: data }: SwrPayload<CaseMaterialReadStatusRequestType>,
  ) => {
    return await request.patch<CaseMaterialReadStatusResponseType>(
      `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${data?.materialId}/read-status`,
      data,
    );
  };

  const { trigger, isMutating, error } = useSWRMutation(
    caseInfo ? QUERY_KEYS.READ_STATUS : null,
    updateReadStatus,
    {
      onSuccess: () => {
        log({
          logLevel: 1,
          message: `HK-UI-FE: caseId ${caseInfo?.id} - Material [id] read status updated`,
        });
      },
      onError: (error) => {
        console.error('Error updating material read status', error);
        log({
          logLevel: 3,
          message: 'HK-UI-FE: Error updating material read status',
          errorMessage: 'HK-UI-FE: Error updating material read status',
        });
      },
    },
  );

  return { trigger, isMutating, error };
};
