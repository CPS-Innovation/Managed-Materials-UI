import { AxiosError, AxiosInstance } from 'axios';
import { useState } from 'react';

import { useAxiosInstance } from '../../../caseWorkApp/components/utils/getData';

type UseDocumentCheckoutOptions = { caseId?: number; urn?: string };
type ErrorResponse = { Error?: unknown };

const defaultMessage = 'An unexpected server error occurred';


function normalizeMessage(error: string): string {
  return error.charAt(0).toLowerCase() + error.slice(1);
}


const checkOutDocumentFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
  documentId: string;
  versionId: number | string;
}) => {
  try {
    const response = await p.axiosInstance.post(
      `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.versionId}/checkout`
    );

    return { success: true, data: { response } } as const;
  } catch (error: unknown) {
    if (!(error instanceof AxiosError)) {
      return {
        success: false,
        status: 'generic error',
        message: 'An unexpected error occurred'
      } as const;
    }

    const { status, data } = error.response ?? {};
    
    let message = defaultMessage;

    if (data && typeof data === 'object') {
      const error = (data as ErrorResponse).Error;

      if (typeof error === 'string' && error.length > 0) {
        message = normalizeMessage(error);
      }
    }

    return status === 409
      ? ({
          success: false,
          status: 'locked',
          message
        } as const)
      : ({
          success: false,
          status: 'generic error',
          message
        } as const);
  }
};

export const checkInDocumentFromAxiosInstance = async (_: {
  axiosInstance: AxiosInstance;
  caseId: number;
  urn: string;
  documentId: string;
  versionId: number | string;
}) => {
  try {
    // await p.axiosInstance.delete(
    //   `/api/urns/${p.urn}/cases/${p.caseId}/documents/${p.documentId}/versions/${p.versionId}/checkout`
    // );

    return { success: true } as const;
  } catch (error: unknown) {
    if (!!error && typeof error === 'object' && 'message' in error)
      console.error(error?.message);

    return { success: false } as const;
  }
};

export const useDocumentCheckOutRequest = ({
  caseId,
  urn
}: UseDocumentCheckoutOptions) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const axiosInstance = useAxiosInstance();

  const checkOut = async (fnProps: {
    documentId: string;
    versionId: number | string;
  }) => {
    if (!urn) return { success: false, message: 'no urn provided' } as const;
    if (!caseId)
      return { success: false, message: 'no caseId provided' } as const;

    setIsLoading(true);
    const resp = await checkOutDocumentFromAxiosInstance({
      axiosInstance,
      urn,
      caseId,
      ...fnProps
    });
    setIsLoading(false);

    return resp;
  };

  const checkIn = async (fnProps: {
    documentId: string;
    versionId: number;
  }) => {
    if (!urn) return { success: false, message: 'no urn provided' } as const;
    if (!caseId)
      return { success: false, message: 'no caseId provided' } as const;

    setIsLoading(true);
    const resp = await checkInDocumentFromAxiosInstance({
      axiosInstance,
      urn,
      caseId,
      ...fnProps
    });
    setIsLoading(false);

    return resp;
  };

  return { checkIn, checkOut, isLoading };
};
