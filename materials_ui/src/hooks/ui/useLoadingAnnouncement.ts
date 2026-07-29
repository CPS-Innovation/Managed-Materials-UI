import { useEffect, useRef } from 'react';

import { LOADING_COMPLETE_MESSAGE, useLoadingAnnouncerStore } from '../../stores';

export const useLoadingAnnouncement = (
  isLoading: boolean,
  loadingMessage: string,
  completeMessage: string = LOADING_COMPLETE_MESSAGE,
) => {
  const startLoading = useLoadingAnnouncerStore((state) => state.startLoading);
  const stopLoading = useLoadingAnnouncerStore((state) => state.stopLoading);

  const latestCompleteMessage = useRef(completeMessage);
  latestCompleteMessage.current = completeMessage;

  useEffect(() => {
    if (!isLoading) return;

    startLoading(loadingMessage);

    return () => stopLoading(latestCompleteMessage.current);
  }, [isLoading, loadingMessage, startLoading, stopLoading]);
};
