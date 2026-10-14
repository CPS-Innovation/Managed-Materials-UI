export const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID;
export const MSAL_TENANT_ID = import.meta.env.VITE_MSAL_TENANT_ID;
export const MSAL_REDIRECT_URI = import.meta.env.VITE_MSAL_REDIRECT_URI;

export const URL = {
  CHECK_YOUR_SELECTION: '/reclassify-to-unused',
  DISCARD_MATERIAL: '/materials/discard-material',
  RECLASSIFY: '/reclassify',
  HOME: '/home',
  ROOT: '/',
  PCD_REQUEST: '/pcd-request',
  PCD_REQUEST_DETAILS: '/pcd-request/:pcdId',
  MATERIALS: '/materials',
  COMMUNICATIONS: '/communications',
  ERROR: '/error',
  PCD_REVIEW: '/pcd-review',
  PCD_REVIEW_DETAILS: '/pcd-review:pcdId',
};

export const APP_DEFAULT_PAGE = URL.ROOT;

export const POLARIS_GATEWAY_URL = import.meta.env.VITE_POLARIS_GATEWAY_URL;
export const POLARIS_GATEWAY_SCOPE = import.meta.env.VITE_POLARIS_GATEWAY_SCOPE;

export const REAUTH_REDIRECT_URLS_OUTBOUND = (
  import.meta.env.VITE_REAUTH_REDIRECT_URL_OUTBOUND || '/auth-refresh-outbound,/polaris'
).split(',');
export const REAUTH_REDIRECT_URL_INBOUND =
  import.meta.env.VITE_REAUTH_REDIRECT_URL_INBOUND || '/auth-refresh-inbound';

export const CASEWORK_APP_URL = import.meta.env.VITE_CWA_URL;

export const API_ENDPOINTS = {
  AUTO_RECLASSIFY: '/uma-reclassify',
  CASE_INFO: '/case-info',
  CASE_MATERIALS: '/case-materials',
  CASE_MATERIAL_RENAME: '/material/rename',
  CASE_MATERIAL_READ_STATUS: '/material/read-status',
  CASE_MATERIAL_BULK_SET_UNUSED: '/case-materials/bulk-set-unused',
  CASE_MATERIAL_DOCUMENT_PREVIEW: '/case-materials/preview',
  CASE_MATERIAL_DISCARD: '/material/discard',
  PCD_REQUEST_LIST: '/case/{caseId}/pcd-requests/core',
  PCD_REQUEST_DETAILS: '/case/{caseId}/pcd-request/{pcdId}',
  CASE_MATERIAL_FULL_DOCUMENT: '/case-materials/document',
  DOCUMENT_TYPES: '/document/document-types',
  CASE_WITNESSES: '/case-witnesses',
  WITNESS_STATEMENTS: '/witnesses/{witnessId}/statements',
  RECLASSIFY: '/material/{materialId}/reclassify-complete',
  EXHIBIT_PRODUCERS: '/exhibit-producers',
};
