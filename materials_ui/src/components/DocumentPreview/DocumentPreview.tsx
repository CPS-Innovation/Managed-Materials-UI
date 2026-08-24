import { Banner } from '../../components';
import { useDocumentPreview } from '../../hooks/';
import { CaseMaterialsType } from '../../schemas/caseMaterials';
import { ErrorSummary } from '../ErrorSummary/ErrorSummary';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { PdfViewer } from '../PdfViewer/PdfViewer';

type Props = { row: CaseMaterialsType };

export default function DocumentPreview({ row }: Props) {
  const {
    data: caseDocumentData,
    loading: caseDocumentLoading,
    error: caseDocumentError,
  } = useDocumentPreview({ materialId: row.materialId });
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
      {!caseDocumentError && <PdfViewer file={caseDocumentData} fileName={row.subject} />}
    </>
  );
}
