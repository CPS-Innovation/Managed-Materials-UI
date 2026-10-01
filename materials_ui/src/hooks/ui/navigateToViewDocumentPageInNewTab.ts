export const navigateToViewDocumentPageInNewTab = (p: {
  urn: string;
  caseId: number;
  materialId: string | number;
  documentId: string | number;
}) => {
  window.open(
    `${import.meta.env.BASE_URL}${p.urn}/${p.caseId}/view-document/${p.materialId}/${p.documentId}`,
  );
};
