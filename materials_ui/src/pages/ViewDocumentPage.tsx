import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import { useDocumentPdfUrl } from '../hooks/documents/useDocumentPdfUrl';
import { useAxiosInstance } from '../materials_components/DocumentSelectAccordion/getters/getAxiosInstance';
import {
  safeGetDocumentListFromAxiosInstance,
  TDocumentList
} from '../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { GovUkBanner } from '../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import './ViewDocumentPage.scss';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const useDocumentListFromAxiosInstance = (p: {
  urn: string;
  caseId: number;
}) => {
  const axiosInstance = useAxiosInstance();
  const [documentList, setDocumentList] = useState<
    TDocumentList | null | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      const documentListResp = await safeGetDocumentListFromAxiosInstance({
        axiosInstance,
        urn: p.urn,
        caseId: p.caseId
      });
      setDocumentList(documentListResp.success ? documentListResp.data : null);
    })();
  }, []);

  return { data: documentList };
};

const LoadAndViewPdf = (p: {
  urn: string;
  caseId: number;
  materialId: string;
}) => {
  const { data: pdfUrl } = useDocumentPdfUrl(p);
  const { data: documentList } = useDocumentListFromAxiosInstance(p);
  const [numPages, setNumPages] = useState<number>();
  useEffect(() => {
    const documentPresentationTitle = documentList?.find(
      (x) => x.parentId === p.materialId
    )?.presentationTitle;
    const documentTitleSuffix = ' - Managed Materials';
    const documentTitlePrefix = (() => {
      if (documentPresentationTitle === undefined) return `Document Loading`;
      if (documentPresentationTitle === null) return `Document Data Not Found`;
      return `${documentPresentationTitle}`;
    })();
    document.title = `${documentTitlePrefix}${documentTitleSuffix}`;
  }, [documentList]);

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
