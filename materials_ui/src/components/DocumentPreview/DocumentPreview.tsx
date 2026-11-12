import { Banner } from '../../components';
import { useDocumentPreview } from '../../hooks/';
import { CaseMaterialsType } from '../../schemas/caseMaterials';
import { ErrorSummary } from '../ErrorSummary/ErrorSummary';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { PdfViewer } from '../PdfViewer/PdfViewer';

export default function DocumentPreview(p: { row: CaseMaterialsType; caseId: number | string }) {
  const {
    data: caseDocumentData,
    loading: caseDocumentLoading,
    error: caseDocumentError,
  } = useDocumentPreview({
    materialId: p.row.materialId,
    documentId: p.row.documentId,
    caseId: p.caseId,
  });
  const is403Error = caseDocumentError?.toString().includes('403');

  return (
    <>
      <LoadingSpinner isLoading={caseDocumentLoading} textContent="Loading preview..." />
      {caseDocumentError && is403Error && (
        <Banner
          type="error"
          header="This document is password protected"
          content="Ask the agency who supplied it to remove the password and resend the document."
        />
      )}
      {caseDocumentError && !is403Error && (
        <ErrorSummary
          errorTitle="There is a problem"
          errorMessage="This document cannot be shown. You can still view it in CMS."
        />
      )}
      {!caseDocumentError && <PdfViewer file={caseDocumentData} fileName={p.row.subject} />}
    </>
  );
}
