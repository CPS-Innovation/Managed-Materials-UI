import { useState } from 'react';
import { usePagination } from 'react-use-pagination';
import { useLoadingAnnouncement } from '../../hooks/ui/useLoadingAnnouncement';
import { usePageColors } from '../../hooks/ui/usePageColors';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner.tsx';
import { MacDocument, MacPage } from '../MacReactPdf/MacReactPdf.tsx';
import { Pagination } from '../Pagination/Pagination.tsx';
import './PdfViewer.css';

// TODO: update 'file' type
type Props = { file: any; fileName: string };

export const PdfViewer = ({ file, fileName }: Props) => {
  const [numItems, setNumItems] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { currentPage, setNextPage, setPreviousPage, setPage, totalPages } = usePagination({
    initialPageSize: 1,
    totalItems: numItems,
  });
  const pageColors = usePageColors();

  const loadingMessage = `The document preview for ${fileName} is loading. Please wait.`;
  const loadedMessage = `The document "${fileName}" has finished loading and is ready to view. Please use the arrow keys to navigate through the document.`;

  useLoadingAnnouncement(isLoading, loadingMessage, loadedMessage);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumItems(numPages);
    setIsLoading(false);
  }

  return (
    <div>
      <MacDocument
        className="pdf-page-container"
        file={file}
        externalLinkTarget="_blank"
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<LoadingSpinner isLoading announce={false} textContent="Loading preview..." />}
        aria-label={isLoading ? loadingMessage : loadedMessage}
      >
        <div className="pagination-wrapper">
          <Pagination
            setPage={setPage}
            setNextPage={setNextPage}
            setPreviousPage={setPreviousPage}
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </div>
        <MacPage
          pageNumber={currentPage + 1}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          pageColors={pageColors}
        />
        <div className="pagination-wrapper">
          <Pagination
            setPage={setPage}
            setNextPage={setNextPage}
            setPreviousPage={setPreviousPage}
            totalPages={totalPages}
            currentPage={currentPage}
          />
        </div>
      </MacDocument>
    </div>
  );
};
