import { PropsWithChildren, createContext, useState } from 'react';
import { AppContextType } from '../schemas/app';
import { BannerType } from '../schemas/banner';

type AppContextTypeWithSetter = AppContextType & {
  banners: BannerType[];
  clearBanners: () => void;
  removeBanner: (bannerIdentifier: string) => void;
  setBannerState: (banner: BannerType, persist?: boolean) => void;
  setWmTriageUrl: (url?: string | null) => void;
};

export const AppContext = createContext<AppContextTypeWithSetter>({
  banners: [],
  clearBanners: () => null,
  wmReturnUrl: null,
  removeBanner: () => null,
  setBannerState: () => null,
  setWmTriageUrl: () => null,
});

export const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [banners, setBanner] = useState<BannerType[]>([]);
  const [wmReturnUrl, setWMReturnUrl] = useState<string | null>(null);

  const setBannerState = (banner: BannerType, persist?: boolean) => {
    if (persist) {
      setBanner((prevState) => [...prevState, banner]);
    } else {
      setBanner([banner]);
    }
  };

  const clearBanners = () => {
    setBanner([]);
  };

  const removeBanner = (bannerIdentifier: string) => {
    setBanner(banners.filter((banner) => banner.identifier !== bannerIdentifier));
  };

  const setWmTriageUrl = (url?: string | null) => {
    setWMReturnUrl(url || null);
  };

  return (
    <AppContext.Provider
      value={{ banners, clearBanners, wmReturnUrl, removeBanner, setBannerState, setWmTriageUrl }}
    >
      {children}
    </AppContext.Provider>
  );
};
