import { useCallback } from 'react';
import { useRequest } from '../';

// log levels (e.g., 0: Info, 1: Warning, 2: Error, 3: Critical)
export type LogLevel = 0 | 1 | 2 | 3;

export interface LogPayload {
  logLevel: LogLevel;
  message: string;
  errorMessage?: string;
}

export const useLogger = () => {
  const request = useRequest();

  const log = useCallback(
    async (payload: LogPayload) => {
      try {
        await request.post('/hk-logger', payload);
      } catch (error) {
        console.error('Failed to send log:', error);
      }
    },
    [request],
  );

  return { log };
};
