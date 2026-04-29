import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import { useDocumentPdfUrl } from '../hooks/documents/useDocumentPdfUrl';
import { GovUkBanner } from '../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import './ViewDocumentPage.scss';

const LoadAndViewPdf = (p: {
  urn: string;
  caseId: number;
  materialId: string;
}) => {
  const { data: pdfUrl } = useDocumentPdfUrl(p);

  return (
    <div>
      {pdfUrl === undefined && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner isLoading={true} textContent="Fetching document" />
        </div>
      )}
      {pdfUrl === null && (
        <div>
          <br />
          <GovUkBanner
            variant="info"
            headerTitle="Error"
            contentHeading="Unable to fetch document"
            contentBody="This could be due to an error, the wrong url or you do not have access to this document"
          />
        </div>
      )}
      {!!pdfUrl && (
        <object
          data={pdfUrl}
          type="application/pdf"
          style={{ width: '100%', height: '99vh' }}
        />
      )}
    </div>
  );
};

export const ViewDocumentPage = () => {
  const { urn, caseId, documentId } = useParams();
  const caseIdInt = caseId ? +caseId : 0;

  useEffect(() => {
    window.document.body.classList.add('hide-header');
    window.document.body.classList.add('hide-footer');

    return () => {
      window.document.body.classList.remove('hide-header');
      window.document.body.classList.remove('hide-footer');
    };
  }, []);

  if (!!urn && !!caseId && caseIdInt > 0 && !!documentId) {
    return (
      <div>
        <LoadAndViewPdf urn={urn} caseId={caseIdInt} materialId={documentId} />
      </div>
    );
  }
};
