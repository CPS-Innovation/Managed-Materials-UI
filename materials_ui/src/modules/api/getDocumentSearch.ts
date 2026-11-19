// // `/cases/${route.caseId}/materials/${route.materialId}/documents/${route.documentId}/search`

// import { AxiosInstance } from 'axios';

// const getDocumentSearch = (p: {
//   axiosInstance: AxiosInstance;
//   caseId: string | number;
//   materialId: string | number;
//   documentId: string | number;
// }) =>
//   p.axiosInstance.get<unknown>(
//     `/cases/${p.caseId}/materials/${p.materialId}/documents/${p.documentId}/search`,
//   );

// const tryGetDocumentSearch = async (p: {
//   axiosInstance: AxiosInstance;
//   caseId: string | number;
//   materialId: string | number;
//   documentId: string | number;
// }) => {
//   try {
//     const response = await getDocumentSearch(p);
//     return { success: true, data: response.data } as const;
//   } catch (err) {
//     const error = err as Error;
//     return { success: false, error } as const;
//   }
// };

// export const getParsedDocumentSearch = (async (p: {
//   axiosInstance: AxiosInstance;
//   caseId: string | number;
//   materialId: string | number;
//   documentId: string | number;
// }) => {
//   const response = await tryGetDocumentSearch(p);
//   if (!response.success) return { ...response, userMessage: 'Failed to get document search' };

//   const parsedResp = documentSearchSchema.safeParse(response.data);
//   if (parsedResp.success) return { ...parsedResp, userMessage: 'Successfully got document search' };
//   return {
//     ...parsedResp,
//     userMessage: 'Failed to parse document search',
//     errorDetails: parsedResp.error.issues,
//   };
// }) satisfies (p: any) => Promise<ApiParsedResponseBaseType>;
