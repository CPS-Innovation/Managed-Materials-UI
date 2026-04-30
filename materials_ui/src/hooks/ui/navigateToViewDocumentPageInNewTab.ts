export const navigateToViewDocumentPageInNewTab = (p: {
  urn: string;
  caseId: number;
  materialId: string | number;
}) => {
  window.open(
    `${import.meta.env.BASE_URL}${p.urn}/${p.caseId}/view-document/${p.materialId}`
  );
};
