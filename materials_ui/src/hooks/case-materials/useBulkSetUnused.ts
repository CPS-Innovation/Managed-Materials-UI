import { AxiosError } from 'axios';
import useSWRMutation from 'swr/mutation';
import { useBanner, useLogger, useRequest } from '..';
import { QUERY_KEYS } from '../../constants/query';
import { SwrPayload } from '../../schemas';
import { BulkSetUnusedRequestType, BulkSetUnusedResponseType } from '../../schemas/bulkSetUnused';
import { useCaseInfoStore } from '../../stores';

type UseBulkSetUnusedOptions = {
  onError?: (error: AxiosError) => void;
  onSuccess?: (response: { data: BulkSetUnusedResponseType }) => void;
};

export const useBulkSetUnused = ({ onError, onSuccess }: UseBulkSetUnusedOptions) => {
  const request = useRequest();
  const { resetBanner } = useBanner();
  const { log } = useLogger();
  const { caseInfo } = useCaseInfoStore();

  const postBulkSetUnused = async (
    _url: string,
    { arg: data }: SwrPayload<BulkSetUnusedRequestType>,
  ) => {
    resetBanner();

    return request
      .post<BulkSetUnusedResponseType>(
        `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/bulk-set-unused`,
        data,
      )
      .then((response) => response);
  };

  const { trigger, isMutating, error, data } = useSWRMutation(
    caseInfo ? QUERY_KEYS.BULK_SET_UNUSED : null,
    postBulkSetUnused,
    {
      onSuccess,
      onError: (error: AxiosError) => {
        if (onError) {
          onError(error);
        }

        log({
          logLevel: 3,
          message: 'HK-UI-FE: Failed to update status to Unused for selected materials.',
        });
      },
    },
  );

  return { trigger, isMutating, error, data };
};
