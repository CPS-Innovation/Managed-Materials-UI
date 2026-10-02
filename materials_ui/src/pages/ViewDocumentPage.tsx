import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../components';
import { MacDocument, MacPage } from '../components/MacReactPdf/MacReactPdf';
import { useDocumentPdfUrl } from '../hooks/documents/useDocumentPdfUrl';
import { usePageColors } from '../hooks/ui/usePageColors';
import { useAxiosInstance } from '../materials_components/DocumentSelectAccordion/getters/getAxiosInstance';
import {
  safeGetDocumentListFromAxiosInstance,
  TDocumentList,
} from '../materials_components/DocumentSelectAccordion/getters/getDocumentList';
import { GovUkBanner } from '../materials_components/DocumentSelectAccordion/templates/GovUkBanner';
import { stripCmsPrefix } from '../utils/cmsStringTransform';
import './ViewDocumentPage.scss';

const useDocumentListFromAxiosInstance = (p: { caseId: number }) => {
  const axiosInstance = useAxiosInstance();
  const [documentList, setDocumentList] = useState<TDocumentList | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const documentListResp = await safeGetDocumentListFromAxiosInstance({
        axiosInstance,
        caseId: p.caseId,
      });
      setDocumentList(documentListResp.success ? documentListResp.data : null);
    })();
  }, []);

  return { data: documentList };
};

const LoadAndViewPdf = (p: { caseId: number; materialId: string; documentId: string | number }) => {
  const { data: pdfUrl } = useDocumentPdfUrl(p);
  const { data: documentList } = useDocumentListFromAxiosInstance(p);
  const [numPages, setNumPages] = useState<number>();
  const pageColors = usePageColors();

  useEffect(() => {
    const doc = documentList?.find(
      (x) => stripCmsPrefix(x.parentId) === stripCmsPrefix(p.materialId),
    );
    const documentPresentationTitle = doc?.presentationTitle;
    const documentTitleSuffix = ' - Managed Materials';
    const documentTitlePrefix = (() => {
      if (documentPresentationTitle) return `${documentPresentationTitle}`;
      if (documentList) return `Document Data Not Found`;
      if (documentList === undefined) return `Document Loading`;
    })();
    document.title = `${documentTitlePrefix}${documentTitleSuffix}`;
  }, [documentList]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {pdfUrl === undefined && <LoadingSpinner isLoading={true} textContent="Fetching document" />}
      {pdfUrl === null && (
        <div>
          <br />
          <GovUkBanner
            variant="error"
            headerTitle="Error"
            contentHeading="This document could not be shown"
            contentBody="Try opening it again. If you still cannot access it, use CMS or contact the product team."
          />
        </div>
      )}
      {!!pdfUrl && (
        <MacDocument
          file={pdfUrl}
          onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
          loading={<LoadingSpinner isLoading={true} textContent="Fetching document" />}
        >
          {[...Array(numPages)].map((_, j) => (
            <MacPage key={j} pageNumber={j + 1} pageColors={pageColors} />
          ))}
        </MacDocument>
      )}
    </div>
  );
};

const useViewDocumentRoute = () => {
  const params = useParams();

  // always exist - due to route pattern
  const caseId = params.caseId ? +params.caseId : 0;
  const materialId = params.materialId!;
  const documentId = params.documentId!;

  return { caseId, documentId, materialId };
};

export const ViewDocumentPage = () => {
  const { caseId, documentId, materialId } = useViewDocumentRoute();

  useEffect(() => {
    window.document.body.classList.add('hide-header');
    window.document.body.classList.add('hide-footer');

    return () => {
      window.document.body.classList.remove('hide-header');
      window.document.body.classList.remove('hide-footer');
    };
  }, []);

  if (isNaN(caseId) || caseId === 0)
    return (
      <GovUkBanner
        variant="info"
        headerTitle="Error"
        contentHeading="Incorrect values from url"
        contentBody="It appears that the wrong values have been passed in the url"
      />
    );

  return <LoadAndViewPdf caseId={caseId} materialId={materialId} documentId={documentId} />;
};
