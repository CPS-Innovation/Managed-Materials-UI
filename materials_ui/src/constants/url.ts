export const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID;
export const MSAL_TENANT_ID = import.meta.env.VITE_MSAL_TENANT_ID;
export const MSAL_REDIRECT_URI = import.meta.env.VITE_MSAL_REDIRECT_URI;

export const URL = {
  CHECK_YOUR_SELECTION: '/reclassify-to-unused',
  DISCARD_MATERIAL: '/materials/discard-material',
  RECLASSIFY: '/reclassify',
  HOME: '/home',
  ROOT: '/',
  INIT: '/init',
  PCD_REQUEST: '/pcd-request',
  PCD_REQUEST_DETAILS: '/pcd-request/:pcdId',
  MATERIALS: '/materials',
  COMMUNICATIONS: '/communications',
  ERROR: '/error',
  PCD_REVIEW: '/pcd-review',
  PCD_REVIEW_DETAILS: '/pcd-review:pcdId'
};

export const APP_DEFAULT_PAGE = URL.ROOT;

export const BE_URL = import.meta.env.VITE_HOUSEKEEPING_BACKEND_URL;

export const POLARIS_GATEWAY_URL = import.meta.env.VITE_POLARIS_GATEWAY_URL;
export const POLARIS_GATEWAY_SCOPE = import.meta.env.VITE_POLARIS_GATEWAY_SCOPE;

export const API_URL = `${BE_URL}/api`;
export const AUTH_URL = `${API_URL}/init`;

export const CASEWORK_APP_URL = import.meta.env.VITE_CWA_URL;

export const API_ENDPOINTS = {
  AUTO_RECLASSIFY: '/uma-reclassify',
  CASE_INFO: '/case-info',
  CASE_LOCK_STATUS: '/case-lock-info',
  CASE_MATERIALS: '/case-materials',
  CASE_MATERIAL_RENAME: '/material/rename',
  CASE_MATERIAL_READ_STATUS: '/material/read-status',
  CASE_MATERIAL_BULK_SET_UNUSED: '/case-materials/bulk-set-unused',
  CASE_MATERIAL_DOCUMENT_PREVIEW: '/case-materials/preview',
  CASE_MATERIAL_DISCARD: '/material/discard',
  CASE_DEFENDANTS: '/case-defendants',
  PCD_REQUEST_LIST: '/case/{caseId}/pcd-requests/core',
  PCD_REQUEST_DETAILS: '/case/{caseId}/pcd-request/{pcdId}',
  CASE_MATERIAL_FULL_DOCUMENT: '/case-materials/document',
  DOCUMENT_TYPES: '/document/document-types',
  CASE_WITNESSES: '/case-witnesses',
  WITNESS_STATEMENTS: '/witnesses/{witnessId}/statements',
  RECLASSIFY: '/material/{materialId}/reclassify-complete',
  EXHIBIT_PRODUCERS: '/exhibit-producers',
  CREATE_WITNESS: '/case-witnesses',
  CREATE_ACTION_PLAN: '/action-plan'
};

export const AUTH_REDIRECT_URL =
  '{apiUrl}/init?caseId={caseId}&screen={screenPath}';
