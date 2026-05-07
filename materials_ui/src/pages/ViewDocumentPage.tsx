import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import { useDocumentPdfUrl } from '../hooks/documents/useDocumentPdfUrl';
import { GovUkBanner } from '../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import './ViewDocumentPage.scss';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const LoadAndViewPdf = (p: {
  urn: string;
  caseId: number;
  materialId: string;
}) => {
  const { data: pdfUrl } = useDocumentPdfUrl(p);
  const [numPages, setNumPages] = useState<number>();

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {pdfUrl === undefined && (
        <LoadingSpinner isLoading={true} textContent="Fetching document" />
      )}
      {pdfUrl === null && (
        <>
          <br />
          <GovUkBanner
            variant="info"
            headerTitle="Error"
            contentHeading="Unable to fetch document"
            contentBody="This could be due to an error, the wrong url or you do not have access to this document"
          />
        </>
      )}
      {!!pdfUrl && (
        <Document
          file={pdfUrl}
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
          loading={
            <LoadingSpinner isLoading={true} textContent="Fetching document" />
          }
        >
          {[...Array(numPages)].map((_, j) => (
            <Page key={j} pageNumber={j + 1} />
          ))}
        </Document>
      )}
    </div>
  );
};

export const ViewDocumentPage = () => {
  const { urn, caseId: caseIdStr, documentId } = useParams();
  const caseId = caseIdStr ? +caseIdStr : 0;

  useEffect(() => {
    window.document.body.classList.add('hide-header');
    window.document.body.classList.add('hide-footer');

    return () => {
      window.document.body.classList.remove('hide-header');
      window.document.body.classList.remove('hide-footer');
    };
  }, []);

  if (!!urn && !!caseIdStr && caseId > 0 && !!documentId) {
    return <LoadAndViewPdf urn={urn} caseId={caseId} materialId={documentId} />;
  }

  return (
    <GovUkBanner
      variant="info"
      headerTitle="Error"
      contentHeading="Incorrect values from url"
      contentBody="It appears that the wrong values have been passed in the url"
    />
  );
};
