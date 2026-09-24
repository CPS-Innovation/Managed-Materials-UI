export const navigateToViewDocumentPageInNewTab = (p: {
  urn: string;
  caseId: number;
  materialId: string | number;
  documentId: string | number;
}) => {
  const url = `${import.meta.env.BASE_URL}${p.urn}/${p.caseId}/view-document/${p.materialId}/${p.documentId}`;
  window.open(url);
};
