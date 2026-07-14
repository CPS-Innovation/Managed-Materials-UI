import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { BannerType } from '../../schemas';

export const useBanner = () => {
  const { banners, clearBanners, removeBanner, setBannerState } = useContext(AppContext);

  const setBanner = (banner: BannerType, persistBanners?: boolean) => {
    setBannerState(banner, persistBanners);
  };

  const resetBanner = (identifier?: string) => {
    if (identifier) {
      removeBanner(identifier);
    } else {
      clearBanners();
    }
  };

  return { banners, resetBanner, setBanner };
};
