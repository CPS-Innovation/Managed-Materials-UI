import { useLoadingAnnouncement } from '../../hooks';

type Props = { isLoading: boolean; textContent?: string; announce?: boolean };

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
}: Props) => {
  useLoadingAnnouncement(announce && isLoading, toLoadingMessage(textContent));

  if (!isLoading) return null;

  return (
    <div className="hods-loading-spinner" aria-hidden="true">
      <div className="hods-loading-spinner__spinner"></div>
      <div className="hods-loading-spinner__content">
        <h1 className="govuk-heading-m">{textContent}</h1>
      </div>
    </div>
  );
};
