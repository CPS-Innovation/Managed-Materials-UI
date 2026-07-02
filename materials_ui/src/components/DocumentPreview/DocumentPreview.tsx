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
    error: caseDocumentError
  } = useDocumentPreview({ materialId: row.materialId });

  const errorTitle = caseDocumentError?.toString().includes('403')
    ? 'This document is password protected'
    : 'There is a problem';

  const errorMessage = caseDocumentError?.toString().includes('403')
    ? 'Ask the agency who supplied it to remove the password and resend the document.'
    : 'This document cannot be shown. You can still view it in CMS.';

  let content = null;

  if (!caseDocumentLoading) {
    if (caseDocumentError) {
      content = caseDocumentError.toString().includes('403') ? (
        <Banner type="error" header={errorTitle} content={errorMessage} />
      ) : (
        <ErrorSummary errorTitle={errorTitle} errorMessage={errorMessage} />
      );
    } else if (caseDocumentData) {
      content = <PdfViewer file={caseDocumentData} fileName={row.subject} />;
    }
  }

  return (
    <>
      <LoadingSpinner
        isLoading={caseDocumentLoading}
        textContent="Loading preview..."
      />
      {content}
    </>
  );
}
