import { AxiosInstance } from 'axios';
import { useState } from 'react';
import { z } from 'zod';

import { useAxiosInstance } from '../../../caseWorkApp/components/utils/getData';

const extractReadableMessageFromError = (error: unknown) => {
  const errorSchema = z.object({ response: z.object({ data: z.object({ Error: z.string() }) }) });
  const parsed = errorSchema.safeParse(error);
  if (!parsed.success) return null;

  const errorMessage = parsed.data.response.data.Error;

  return errorMessage.charAt(0).toLowerCase() + errorMessage.slice(1);
};

const checkOutDocumentFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string;
  documentId: number | string;
}) => {
  try {
    const response = await p.axiosInstance.post(
      `/cases/${p.caseId}/materials/${p.materialId}/documents/${p.documentId}/checkout`,
    );

    return { success: true, data: { response } } as const;
  } catch (error: unknown) {
    const errorStatusSchema = z.object({ status: z.number() });
    const parsedResp = errorStatusSchema.safeParse(error);

    const defaultMessage = 'An unexpected server error occurred';
    if (parsedResp.success && parsedResp.data.status === 409) {
      const message = extractReadableMessageFromError(error) ?? defaultMessage;
      return { success: false, status: 'locked', message } as const;
    }

    return { success: false, status: 'generic error', message: defaultMessage } as const;
  }
};

export const checkInDocumentFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  caseId: string | number;
  materialId: string;
  documentId: number | string;
}) => {
  try {
    await p.axiosInstance.delete(
      `/cases/${p.caseId}/materials/${p.materialId}/documents/${p.documentId}/checkout`,
      { fetchOptions: { keepalive: true } },
    );

    return { success: true } as const;
  } catch (error: unknown) {
    if (!!error && typeof error === 'object' && 'message' in error) console.error(error?.message);

    return { success: false } as const;
  }
};

export const useDocumentCheckOutRequest = ({ caseId }: { caseId: string | number }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const axiosInstance = useAxiosInstance();

  const checkOut = async (fnProps: { materialId: string; documentId: number | string }) => {
    if (!caseId) return { success: false, message: 'no caseId provided' } as const;

    setIsLoading(true);
    const resp = await checkOutDocumentFromAxiosInstance({
      axiosInstance,
      caseId,
      materialId: fnProps.materialId,
      documentId: fnProps.documentId,
    });
    setIsLoading(false);

    return resp;
  };

  const checkIn = async (fnProps: { materialId: string; documentId: number }) => {
    if (!caseId) return { success: false, message: 'no caseId provided' } as const;

    setIsLoading(true);
    const resp = await checkInDocumentFromAxiosInstance({
      axiosInstance,
      caseId,
      materialId: fnProps.materialId,
      documentId: fnProps.documentId,
    });
    setIsLoading(false);

    return resp;
  };

  return { checkIn, checkOut, isLoading };
};
