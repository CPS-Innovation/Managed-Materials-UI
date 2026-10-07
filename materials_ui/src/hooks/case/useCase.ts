import { AxiosInstance } from 'axios';
import useSWR from 'swr';
import { useAxiosInstance } from '../../caseWorkApp/components/utils/getData';
import { CaseSchema } from '../../schemas/caseDetails';

const getCase = (p: { axiosInstance: AxiosInstance; caseId: string | number }) =>
  p.axiosInstance.get<unknown>(`/cases/${p.caseId}`).then((response) => response.data);

export const getSafeCase = async (p: { axiosInstance: AxiosInstance; caseId: string | number }) => {
  try {
    const caseData = await getCase(p);
    return CaseSchema.safeParse(caseData);
  } catch (error) {
    return { success: false, error } as const;
  }
};

export const useSafeCase = (p: { caseId: string | number }) => {
  const axiosInstance = useAxiosInstance();
  return useSWR(['getSafeCase', p.caseId], () => getSafeCase({ axiosInstance, caseId: p.caseId }));
};
