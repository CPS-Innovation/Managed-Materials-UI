export const navigateToViewDocumentPageInNewTab = (p: {
  caseId: string | number;
  materialId: string | number;
  documentId?: string | number;
}) => {
  window.open(
    `${import.meta.env.BASE_URL}${p.caseId}/view-document/${p.materialId}/${p.documentId}`,
  );
};
