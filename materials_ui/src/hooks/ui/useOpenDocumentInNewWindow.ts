import { useCaseInfoStore } from '../../stores';
import { useAxiosInstance } from './useRequest';

const WINDOW_WIDTH = 1200;
const WINDOW_HEIGHT = 800;

const POPUP_STYLES = `
  body { font-family: Arial, sans-serif; }
  .govuk-main-wrapper { padding: 40px 15px 0; max-width: 960px; margin: 0 auto; }
  .govuk-grid-row { display: flex; }
  .govuk-grid-column-two-thirds { width: 66.66%; }
  .govuk-heading-l { font-size: 36px; font-weight: 700; margin-bottom: 20px; }
  .govuk-heading-m { font-size: 24px; font-weight: 700; }
  .govuk-body { font-size: 19px; line-height: 1.5; }
  .hods-loading-spinner { padding-top: 20px; }
  .hods-loading-spinner__spinner {
    margin-left: auto; margin-right: auto;
    width: 80px; height: 80px;
    border: 12px solid #DEE0E2; border-top-color: #1d70b8;
    border-radius: 50%;
    animation: hods-loading-spinner-animation 2s linear infinite;
  }
  .hods-loading-spinner__content { padding-top: 20px; text-align: center; }
  @keyframes hods-loading-spinner-animation { to { transform: rotate(360deg); } }
`;

const getCenteredWindowPosition = () => {
  const left = window.screenX + (window.outerWidth - WINDOW_WIDTH) / 2;
  const top = window.screenY + (window.outerHeight - WINDOW_HEIGHT) / 2;

  console.log({ left, top });

  return `top=${top},left=${left},scrollbars=yes,resizable=yes`;
};

const renderLoadingPage = (win: Window) => {
  win.document.title = 'Loading material preview...';

  const style = win.document.createElement('style');
  style.textContent = POPUP_STYLES;
  win.document.head.appendChild(style);

  win.document.body.innerHTML = `
    <div class="hods-loading-spinner" role="status" aria-live="polite">
      <div class="hods-loading-spinner__spinner"></div>
      <div class="hods-loading-spinner__content">
        <div class="govuk-heading-m">Loading preview...</div>
      </div>
    </div>`;
};

const renderErrorPage = (win: Window) => {
  win.document.title = 'Preview unavailable';

  win.document.body.innerHTML = `
    <main class="govuk-main-wrapper govuk-main-wrapper--l" id="main-content" role="main">
      <div class="govuk-grid-row">
        <div class="govuk-grid-column-two-thirds">
          <h1 class="govuk-heading-l">This document could not be shown</h1>
          <p class="govuk-body">
            Try opening it again. If you still cannot access it, use CMS or contact the product team.
          </p>
        </div>
      </div>
    </main>`;
};
const renderPdfUrlInIframe = (p: { win: Window; pdfUrl: string }) => {
  p.win.document.documentElement.style.cssText =
    'margin:0;padding:0;height:100%;overflow:hidden;';
  p.win.document.body.style.cssText =
    'margin:0;padding:0;height:100%;overflow:hidden;';

  const titleElement = p.win.document.createElement('title');
  titleElement.textContent = 'Document Preview';
  p.win.document.head.appendChild(titleElement);

  // Clear loading  content
  p.win.document.body.innerHTML = '';

  const iframe = p.win.document.createElement('iframe');
  iframe.src = p.pdfUrl;
  iframe.style.cssText = 'display:block;width:100%;height:100%;border:none;';
  p.win.document.body.appendChild(iframe);
};

const openReadyTab = async () => {
  try {
    const win = window.open('', '_blank') as Window | null;
    if (!win) return null;

    await new Promise<void>((resolve) => {
      if (win!.document.readyState === 'complete') {
        resolve();
      } else {
        win!.addEventListener('load', () => resolve(), { once: true });
      }
    });
    return win;
  } catch {
    return null;
  }
};

export const useOpenDocumentInNewWindow = () => {
  const request = useAxiosInstance();
  const { caseInfo } = useCaseInfoStore();

  const openPreview = async (materialId: number) => {
    if (!caseInfo) return;

    let win: Window | null = null;

    try {
      win = window.open('', '_blank', getCenteredWindowPosition());
      await new Promise<void>((resolve) => {
        if (win!.document.readyState === 'complete') {
          resolve();
        } else {
          win!.addEventListener('load', () => resolve(), { once: true });
        }
      });
      if (!win) return;

      renderLoadingPage(win);

      const response = await request.get(
        `/urns/${caseInfo.urn}/cases/${caseInfo.id}/materials/${materialId}/preview`,
        { responseType: 'blob' }
      );

      const pdfUrl = URL.createObjectURL(response.data);

      win.location.href = pdfUrl;

      win.addEventListener('load', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } catch (error) {
      if (win && !win.closed) {
        renderErrorPage(win);
      }
      console.error('Error opening document preview:', error);
    }
  };

  return { openPreview };
};

export const useOpenDocumentInNewTab = () => {
  const request = useAxiosInstance();
  const { caseInfo } = useCaseInfoStore();

  const openPreview = async (materialId: number) => {
    if (!caseInfo) return;

    const win = await openReadyTab();
    if (!win) return;

    try {
      renderLoadingPage(win);

      const response = await request.get(
        `/urns/${caseInfo.urn}/cases/${caseInfo.id}/materials/${materialId}/preview`,
        { responseType: 'blob' }
      );

      const pdfUrl = URL.createObjectURL(response.data);

      renderPdfUrlInIframe({ win, pdfUrl });

      win.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(pdfUrl);
      });
    } catch (error) {
      if (win && !win.closed) {
        renderErrorPage(win);
      }
      console.error('Error opening document preview:', error);
    }
  };

  return { openPreview };
};
