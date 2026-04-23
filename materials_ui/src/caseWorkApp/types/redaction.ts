type TChildren = [{ id: string; name: string }];

export type TLookupsResponse = {
  areas: { id: string; name: string; children: TChildren }[];
  divisions: { id: string; name: string; children: TChildren }[];
  documentTypes: { id: string, cmsDocTypeId: string; name: string; children: TChildren }[];
  investigatingAgencies: { id: string; name: string; children: TChildren }[];
  missedRedactions: {
    isDeletedPage: boolean;
    id: string;
    name: string;
    children: TChildren;
  }[];
  ouCodeMapping: {
    ouCode: string;
    areaCode: string;
    areaName: string;
    investigatingAgencyCode: string;
    investigatingAgencyName: string;
  }[];
};
