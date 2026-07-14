import { APP_DEFAULT_PAGE } from '../constants/url';

export const isPathCurrentUrl = (currentPath: string, path: string = ''): boolean => {
  if (!path) return false;

  if (currentPath === '/' && path === APP_DEFAULT_PAGE) {
    return true;
  }

  if (path !== '/' && currentPath.includes(path)) {
    return true;
  }

  if (currentPath === path) {
    return true;
  }

  return false;
};

export const isAllowedDomain = (url: string) => {
  const decodedUrl = decodeURIComponent(url);
  const domainToTest = decodedUrl.match(
    /^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im,
  )?.[1];

  const domains: string[] = (import.meta.env.VITE_ALLOWED_RETURN_DOMAINS || '').split(',');

  if (!decodedUrl) return false;

  return domains.some((domain) => domainToTest?.includes(domain));
};
