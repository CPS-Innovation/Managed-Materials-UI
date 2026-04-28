import { AxiosInstance } from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAxiosInstance } from '../hooks/ui/useRequest';
import './ViewDocumentPage.scss';

const getDocumentBlobFromAxiosInstance = async (p: {
  axiosInstance: AxiosInstance;
  urn: string;
  caseId: number;
  documentId: string;
}) => {
  try {
    const response = await p.axiosInstance.get(
      `/urns/${p.urn}/cases/${p.caseId}/materials/${p.documentId}/document`,
      { responseType: 'blob' }
    );

    const blob = response.data;
    if (!(blob instanceof Blob)) {
      throw new Error(`Expected Blob but received ${typeof blob}`);
    }

    return { success: true, data: blob } as const;
  } catch (error) {
    return { success: false, error } as const;
  }
};
const LoadAndViewPdf = (p: {
  urn: string;
  caseId: number;
  documentId: string;
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null | undefined>();
  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    (async () => {
      const resp = await getDocumentBlobFromAxiosInstance({
        axiosInstance,
        ...p
      });

      if (!resp.success) return setPdfUrl(null);

      setPdfUrl(URL.createObjectURL(resp.data));
    })();
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, []);
  return (
    <div>
      {pdfUrl === undefined && <div>Loading...</div>}
      {pdfUrl === null && <div>Error</div>}
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
        <LoadAndViewPdf urn={urn} caseId={caseIdInt} documentId={documentId} />
      </div>
    );
  }
};
