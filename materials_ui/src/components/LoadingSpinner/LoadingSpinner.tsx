import { useLoadingAnnouncement } from '../../hooks';

type Props = {
  isLoading: boolean;
  textContent?: string;
  announce?: boolean;
  completeMessage?: string;
  captionId?: string;
};

const toLoadingMessage = (textContent: string) => {
  // remove trailing ellipses
  const caption = textContent.replace(/\.+$/, '');

  if (caption.toLowerCase().includes('please wait')) {
    return `${caption}.`;
  }

  return `${caption}, please wait.`;
};

export const LoadingSpinner = ({
  isLoading,
  textContent = 'Loading...',
  announce = true,
  completeMessage,
  captionId,
}: Props) => {
  useLoadingAnnouncement(announce && isLoading, toLoadingMessage(textContent), completeMessage);

  if (!isLoading) return null;

  return (
    <div className="hods-loading-spinner" aria-hidden="true">
      <div className="hods-loading-spinner__spinner"></div>
      <div className="hods-loading-spinner__content">
        <h1 id={captionId} className="govuk-heading-m">
          {textContent}
        </h1>
      </div>
    </div>
  );
};
