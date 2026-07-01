/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_REDACTION_LOG_SCOPE: string;
  readonly VITE_POLARIS_GATEWAY_SCOPE: string;
  readonly VITE_POLARIS_GATEWAY_URL: string;
  readonly VITE_REDACTION_LOG_URL: string;
  readonly VITE_APPLICATIONINSIGHTS_CONNECTION_STRING: string;
  readonly VITE_APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE: string;
  readonly VITE_APPLICATIONINSIGHTS_CLOUD_ROLE: string;
}
