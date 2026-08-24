import { create } from 'zustand';

export const LOADING_COMPLETE_MESSAGE = 'Loading complete.';

type LoadingAnnouncerStore = {
  message: string;
  activeCount: number;
  startLoading: (message: string) => void;
  stopLoading: (completeMessage: string) => void;
};

export const useLoadingAnnouncerStore = create<LoadingAnnouncerStore>((set) => ({
  message: '',

  activeCount: 0,

  startLoading: (message) =>
    set((state) =>
      state.activeCount === 0
        ? { activeCount: 1, message }
        : { activeCount: state.activeCount + 1 },
    ),

  stopLoading: (completeMessage) =>
    set((state) => {
      if (state.activeCount === 0) return state;

      const activeCount = state.activeCount - 1;

      return activeCount === 0 ? { activeCount, message: completeMessage } : { activeCount };
    }),
}));
