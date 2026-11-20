import { AxiosInstance } from 'axios';
import z from 'zod';
import { ApiParsedResponseBaseType } from './_helpers';

const materialNotechema = z.object({
  createdByName: z.string(),
  date: z.string(),
  text: z.string(),
});
const materialNotesSchema = z.array(materialNotechema);

const getMaterialNotes = (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string | number;
}) => p.axiosInstance.get<unknown>(`/cases/${p.caseId}/materials/${p.materialId}/notes`);

const tryGetMaterialNotes = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string | number;
}) => {
  try {
    const response = await getMaterialNotes(p);
    return { success: true, data: response.data } as const;
  } catch (err) {
    const error = err as Error;
    return { success: false, error } as const;
  }
};

export const getParsedMaterialNotes = (async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string | number;
}) => {
  const response = await tryGetMaterialNotes(p);
  if (!response.success) return { ...response, userMessage: 'Failed to get material notes' };

  const parsedResp = materialNotesSchema.safeParse(response.data);
  if (parsedResp.success) return { ...parsedResp, userMessage: 'Successfully got material notes' };

  return {
    ...parsedResp,
    userMessage: 'Failed to parse material notes',
    errorDetails: parsedResp.error.issues,
  };
}) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
