type ApiParsedResponseBaseTypeSuccess = { success: true; data: any; userMessage: string };
type ApiParsedResponseBaseTypeFailure = {
  success: false;
  error: Error;
  userMessage: string;
  errorDetails?: unknown;
};
export type ApiParsedResponseBaseType =
  | ApiParsedResponseBaseTypeSuccess
  | ApiParsedResponseBaseTypeFailure;
