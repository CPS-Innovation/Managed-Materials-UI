import { create } from 'zustand';

import { CaseInfoType } from '../schemas';

type CaseStore = {
  caseInfo: CaseInfoType | null;
  isLoading: boolean;
  setCaseInfo: (info: CaseInfoType) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearCaseInfo: () => void;
};

export const useCaseInfoStore = create<CaseStore>((set) => ({
  caseInfo: null,

  isLoading: false,

  setCaseInfo: (info) => set(() => ({ caseInfo: info })),

  setIsLoading: (isLoading) => set(() => ({ isLoading })),

  clearCaseInfo: () => set(() => ({ caseInfo: null })),
}));
