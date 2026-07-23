import { PropsWithChildren, useEffect, useRef } from 'react';
import { BannerType } from '../../schemas';
import './Banner.scss';

type Props = BannerType;

export const Banner = ({ type = 'success', header, content }: PropsWithChildren<Props>) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bannerRef.current?.focus();
  }, []);

  const getBannerClass = () => {
    switch (type) {
      case 'success':
        return 'govuk-notification-banner--success';
      case 'important':
        return 'govuk-notification-banner--important';
      case 'error':
        return 'govuk-notification-banner banner-error';
    }
  };

  const getBannerTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'important':
        return 'Important';
      case 'error':
        return 'There is a problem';
      default:
        return '';
    }
  };

  return (
    <div
      ref={bannerRef}
      className={`govuk-notification-banner ${getBannerClass()}`}
      role="alert"
      aria-label={`${getBannerTitle()}: ${header}${content ? `. ${content}` : ''}`}
      data-module="govuk-notification-banner"
      tabIndex={-1}
    >
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
          {getBannerTitle()}
        </h2>
      </div>

      <div className="govuk-notification-banner__content">
        <h3 className="govuk-notification-banner__heading">{header}</h3>
        {content && <p className="govuk-body">{content}</p>}
      </div>
    </div>
  );
};
