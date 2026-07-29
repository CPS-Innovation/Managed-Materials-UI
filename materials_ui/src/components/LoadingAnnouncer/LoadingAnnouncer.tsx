import { useLoadingAnnouncerStore } from '../../stores';

export const LoadingAnnouncer = () => {
  const message = useLoadingAnnouncerStore((state) => state.message);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="govuk-visually-hidden">
      {message}
    </div>
  );
};
