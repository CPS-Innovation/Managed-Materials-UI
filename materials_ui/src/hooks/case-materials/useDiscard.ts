import { AxiosError } from 'axios';
import useSWRMutation from 'swr/mutation';

import { useCaseInfoStore, useLogger, useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query';
import { SwrPayload } from '../../schemas';
import {
  CaseMaterialDiscardRequestType,
  CaseMaterialDiscardResponseType,
  CaseMaterialsType,
} from '../../schemas/caseMaterials';

export type UseDiscardOptions = { onError?: () => void; onSuccess?: () => void };

export const useDiscard = (material?: CaseMaterialsType, options?: UseDiscardOptions) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();
  const { log } = useLogger();

  const discardMaterialRequest = async (
    _url: string,
    { arg: data }: SwrPayload<CaseMaterialDiscardRequestType>,
  ) => {
    return await request.patch<CaseMaterialDiscardResponseType>(
      `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${material?.materialId}/discard`,
      data,
    );
  };

  const { trigger, isMutating, error } = useSWRMutation(
    caseInfo && material ? QUERY_KEYS.CASE_MATERIAL_DISCARD : null,
    discardMaterialRequest,
    {
      onSuccess: () => {
        if (options?.onSuccess) {
          options?.onSuccess();
        }

        console.log('Material discarded');
        log({
          logLevel: 1,
          message: `HK-UI-FE: caseId ${caseInfo?.id} - Material [${material?.materialId}] discarded`,
          errorMessage: '',
        });
      },
      onError: (error: AxiosError) => {
        if (options?.onError) {
          options?.onError();
        }

        console.error('Error discarding material read status', error);
        log({
          logLevel: 3,
          message: `HK-UI-FE: Error discarding material ${material?.materialId}`,
          errorMessage: `HK-UI-FE: Error discarding material ${material?.materialId}`,
        });
      },
    },
  );

  return { isLoading: isMutating, trigger, error };
};
