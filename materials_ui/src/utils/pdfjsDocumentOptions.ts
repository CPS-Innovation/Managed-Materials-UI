// JPEG 2000 images are decoded by OpenJPEG, shipped as wasm beside pdfjs-dist.
// react-pdf does not bundle that directory. The URL must end with a slash.
export const pdfjsDocumentOptions = { wasmUrl: `${import.meta.env.BASE_URL}wasm/` };
