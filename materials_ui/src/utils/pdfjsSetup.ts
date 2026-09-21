import { pdfjs } from 'react-pdf';

const pdfjsDirPath = `${import.meta.env.BASE_URL}pdfjs/`;
const pdfjsDir =
  typeof window === 'undefined' ? pdfjsDirPath : new URL(pdfjsDirPath, window.location.origin).href;

pdfjs.GlobalWorkerOptions.workerSrc = `${pdfjsDir}pdf.worker.min.mjs`;

export const pdfDocumentOptions = { wasmUrl: pdfjsDir };
