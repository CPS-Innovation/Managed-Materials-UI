import { AxiosError } from 'axios';
import useSWRMutation from 'swr/mutation';

import { useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { AutoReclassifyResponseType } from '../../schemas/classification';
import { useCaseInfoStore } from '../../stores';

type UseAutoReclassifyProps = {
  onError: (error: AxiosError) => void;
  onSuccess: (response: AutoReclassifyResponseType) => void;
};

export const useAutoReclassify = (options?: UseAutoReclassifyProps) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const postAutoReclassify = () =>
    request.post<AutoReclassifyResponseType>(
      `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/uma-reclassify`,
    );

  const { trigger, isMutating, error } = useSWRMutation(
    caseInfo ? QUERY_KEYS.AUTO_RECLASSIFY : null,
    postAutoReclassify,
    {
      onSuccess: async (response) => {
        if (options?.onSuccess) {
          options.onSuccess(response.data);
        }
      },
      onError: (error: AxiosError) => {
        if (options?.onError) {
          options.onError(error);
        }
      },
    },
  );

  return { isPending: isMutating, error, mutate: trigger };
};
