import useSWRMutation from 'swr/mutation';
import { QUERY_KEYS } from '../../constants/query.ts';
import { TDocument } from '../../materials_components/DocumentSelectAccordion/getters/getDocumentList.tsx';
import { CaseMaterialRenameResponseType, CaseMaterialsType } from '../../schemas/caseMaterials.ts';
import { SwrPayload } from '../../schemas/index.ts';
import { useCaseInfoStore } from '../../stores/index.ts';
import { useLogger, useRequest } from '../index.ts';

type UseRenameOptions = { onError?: (error: Error) => void; onSuccess?: () => void };

export const useRename = (
  material: CaseMaterialsType | (TDocument & { materialId?: number }) | null,
  options?: UseRenameOptions,
) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();
  const { log } = useLogger();

  const renameMaterialRequest = (_url: string, { arg: newSubject }: SwrPayload<string>) => {
    return request.patch<CaseMaterialRenameResponseType>(
      `/urns/${caseInfo?.urn}/cases/${caseInfo?.id}/materials/${material?.materialId}/rename`,
      { materialId: material?.materialId, subject: newSubject },
    );
  };
  const { trigger, isMutating } = useSWRMutation(
    caseInfo ? QUERY_KEYS.RENAME_MATERIAL : null,
    renameMaterialRequest,
    {
      onError: (error: Error) => {
        if (options?.onError) options?.onError(error);
        window.scrollTo(0, 0);

        console.error('Error renaming material:', error);
        log({
          logLevel: 1,
          message: `HK-UI-FE: caseId [${caseInfo?.id}] - materialID [${material?.materialId}] has not been renamed.`,
        });
      },
      onSuccess: () => {
        if (options?.onSuccess) options.onSuccess();
        window.scrollTo(0, 0);

        log({
          logLevel: 1,
          message: `HK-UI-FE: caseId [${caseInfo?.id}] - materialID [${material?.materialId}] has been renamed.`,
        });
      },
    },
  );

  return { trigger, isMutating };
};
