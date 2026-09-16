import dayjs from 'dayjs';
import useSWRMutation from 'swr/mutation';

import { useCaseInfoStore, useRequest } from '../';
import { QUERY_KEYS } from '../../constants/query.ts';
import {
  EditExhibitResponseType,
  EditExhibitType,
  EditStatementRequestType,
  EditStatementResponseType,
  EditStatementType,
} from '../../schemas/forms/editStatement.ts';
import { SwrPayload } from '../../schemas/index.ts';

type UseEditMaterialOptions = {
  onError?: () => void;
  onSuccess?: (response: { materialId: number }) => void;
};

export const useEditMaterial = ({ onError, onSuccess }: UseEditMaterialOptions) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const postUpdateStatement = async (
    _url: string,
    { arg: data }: SwrPayload<EditStatementRequestType>,
  ): Promise<EditStatementResponseType> => {
    const response = await request.patch<EditStatementResponseType>(
      `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${data?.materialId}/statement`,
      data,
    );

    return response.data;
  };

  const postUpdateExhibit = async (
    _url: string,
    { arg: data }: SwrPayload<EditExhibitType>,
  ): Promise<EditExhibitResponseType> => {
    const response = await request.patch<EditExhibitResponseType>(
      `urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${data?.materialId}/exhibit`,
      {
        ...data,
        newProducer: data?.existingproducerOrWitnessId ? undefined : data?.producedBy,
        existingProducerOrWitnessId: !data?.existingproducerOrWitnessId
          ? undefined
          : data?.existingproducerOrWitnessId,
      },
    );

    return response.data;
  };

  const { trigger: submitUpdateStatement, isMutating: isStatementUpdating } = useSWRMutation(
    caseInfo ? QUERY_KEYS.UPDATE_STATEMENT : null,
    postUpdateStatement,
    {
      onError,
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess({ materialId: response.updateStatement.id });
        }
      },
    },
  );

  const { trigger: submitUpdateExhibit, isMutating: isExhibitUpdating } = useSWRMutation(
    caseInfo ? QUERY_KEYS.UPDATE_EXHIBIT : null,
    postUpdateExhibit,
    {
      onError,
      onSuccess: (response) => {
        if (onSuccess) {
          onSuccess({ materialId: response.updateExhibit.id });
        }
      },
    },
  );

  const updateStatement = async (data: EditStatementType) => {
    await submitUpdateStatement({
      ...data,
      statementDate: data?.hasStatementDate
        ? dayjs(data?.statementDate).format('YYYY-MM-DD')
        : null,
    });
  };

  const updateExhibit = async (data: EditExhibitType) => {
    await submitUpdateExhibit(data);
  };

  return { loading: isStatementUpdating || isExhibitUpdating, updateExhibit, updateStatement };
};
