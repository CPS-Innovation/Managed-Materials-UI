import useSWR from 'swr';
import { useRequest } from '../';
import { SearchTermResultType } from '../../schemas/documents';
import { useCaseInfoStore } from '../../stores';

export const useSearchTracker = (trigger: unknown) => {
  const request = useRequest();
  const { caseInfo } = useCaseInfoStore();

  const urn = caseInfo?.urn;
  const caseId = caseInfo?.id.toString();

  const postInit = () => request.post(`/urns/${urn}/cases/${caseId}`);

  const getTracker = () => request.get(`/urns/${urn}/cases/${caseId}/tracker`);

  // Start pipeline once per case when first search is triggered
  const { data: postData } = useSWR(
    trigger ? ['tracker-init', urn, caseId] : null,
    postInit,
    { revalidateOnFocus: false }
  );

  // Poll until Completed
  const { data: trackerData, isLoading: trackerLoading } = useSWR(
    postData ? ['tracker-status', urn, caseId] : null,
    getTracker,
    {
      refreshInterval: (latest) =>
        latest?.data.status === 'Running' ||
        latest?.data.status === 'NotStarted' ||
        latest?.data.status === 'DocumentsRetrieved'
          ? 1000
          : 0,
      dedupingInterval: 0,
      revalidateOnFocus: false
    }
  );

  const failedToConvert =
    trackerData?.data.documents?.filter(
      (doc: SearchTermResultType) =>
        doc.status === 'UnableToConvertToPdf' ||
        doc.conversionStatus === 'UnexpectedError' ||
        doc.status === 'OcrAndIndexFailure'
    ) ?? [];

  const isComplete = trackerData?.data.status === 'Completed';

  return { trackerData, trackerLoading, isComplete, failedToConvert };
};
