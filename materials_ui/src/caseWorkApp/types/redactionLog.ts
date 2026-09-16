export type Unit = { id: string; type: string; areaDivisionName: string; name: string };

export type InvestigatingAgency = { id: string; name: string };

export type DocumentType = { id: string; name: string };

export type MissedRedaction = { id: string; name: string };

export type Redaction = {
  missedRedaction: MissedRedaction;
  redactionType: number;
  returnedToInvestigativeAuthority: boolean;
};

export type CmsValues = {
  originalFileName: string;
  documentId: string | number;
  documentType: string;
  fileCreatedDate: string;
  documentTypeId: number;
};

export type RedactionLogData = {
  urn: string;
  unit: Unit;
  investigatingAgency: InvestigatingAgency;
  documentType: DocumentType;
  redactions: Redaction[];
  notes: string;
  chargeStatus: number;
  cmsValues: CmsValues;
};

// the redaction log service's source client id for this app
export const MATERIALS_AND_COMMS_SOURCE_CLIENT_ID = 2;
