import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import { useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const pdfjsDirPath = `${import.meta.env.BASE_URL}pdfjs/`;
const wasmUrl =
  typeof window === 'undefined' ? pdfjsDirPath : new URL(pdfjsDirPath, window.location.origin).href;

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const MacDocument = (p: React.ComponentProps<typeof Document>) => {
  const { children, options: propOptions, ...rest } = p;
  const options = useMemo(() => ({ wasmUrl, ...propOptions }), [propOptions]);

  return (
    <Document options={options} {...rest}>
      {children}
    </Document>
  );
};

export const MacPage = (p: React.ComponentProps<typeof Page>) => {
  const { children, ...rest } = p;
  return <Page {...rest}>{children}</Page>;
};
