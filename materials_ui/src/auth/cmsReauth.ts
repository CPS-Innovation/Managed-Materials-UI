import { AxiosInstance, isAxiosError } from 'axios';

import { REAUTH_REDIRECT_URL_INBOUND, REAUTH_REDIRECT_URLS_OUTBOUND } from '../constants/url';
import { APP_ROUTES } from '../hooks/ui/useAppRoute';

const HANDOFF_ATTEMPT_INDEX_QUERY_PARAM = 'auth-refresh';
const FAIL_CORRELATION_ID_QUERY_PARAM = 'fail-correlation-id';
const AUTH_FAIL_REASON_QUERY_PARAM = 'auth-fail-reason';
const CORRELATION_ID = 'Correlation-Id';
const UNAUTHORISED = 401;

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface AxiosRequestConfig<D = any> {
    pageUrl?: string;
  }
}

const removeHandoffParams = (existingUrl: string) => {
  const url = new URL(existingUrl);
  url.searchParams.delete(HANDOFF_ATTEMPT_INDEX_QUERY_PARAM);
  url.searchParams.delete(AUTH_FAIL_REASON_QUERY_PARAM);
  url.searchParams.delete(FAIL_CORRELATION_ID_QUERY_PARAM);
  return url.toString();
};

const buildRedirectUrl = (
  pageUrl: string,
  outboundUrlIndex: number,
  correlationId: string | null,
) => {
  // outbound endpoints are tried in order
  const outboundUrl = REAUTH_REDIRECT_URLS_OUTBOUND[outboundUrlIndex];

  // no more outbound urls to try
  if (outboundUrl === undefined) {
    return undefined;
  }

  // used to send the browser back to where it started
  const terminationUrl = new URL(removeHandoffParams(pageUrl));

  terminationUrl.searchParams.set(HANDOFF_ATTEMPT_INDEX_QUERY_PARAM, String(outboundUrlIndex));
  terminationUrl.searchParams.set(FAIL_CORRELATION_ID_QUERY_PARAM, String(correlationId));

  const inboundUrl = `${REAUTH_REDIRECT_URL_INBOUND}?${FAIL_CORRELATION_ID_QUERY_PARAM}=${correlationId}&polaris-ui-url=${encodeURIComponent(
    terminationUrl.toString(),
  )}`;

  return `${outboundUrl}?r=${encodeURIComponent(inboundUrl)}`;
};

// this is used to end code execution while the browser is being redirected to a handoff attempt
const navigateAndStopExecution = (window: Window, url: string) => {
  window.location.assign(url);
  return new Promise<never>(() => {});
};

// used as a loop guard against the scenario where handoff succeeds but the backend still returns 401
// so we don't want to try again. Only true when the page load came back from a handoff attempt and then
// cleared (false) by a successful gateway response
let justReturnedFromHandoff = false;

// starts the first handoff attempt with the first outbound url unless loop guard is on
export const addCmsReauthInterceptor = (
  axiosInstance: AxiosInstance,
  window: Window = globalThis.window,
) => {
  // record the page a request is sent from rather than what page we're on when the 401 returns
  // to prevent race conditions
  axiosInstance.interceptors.request.use((config) => {
    config.pageUrl = window.location.href;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      justReturnedFromHandoff = false;
      return response;
    },
    (error) => {
      const shouldStartHandoff =
        isAxiosError(error) && error.status === UNAUTHORISED && !justReturnedFromHandoff;

      if (!shouldStartHandoff) {
        return Promise.reject(error);
      }

      const correlationId = error.config?.headers?.[CORRELATION_ID] ?? null;
      const pageUrl = error.config?.pageUrl ?? window.location.href;
      return navigateAndStopExecution(window, buildRedirectUrl(pageUrl, 0, correlationId)!);
    },
  );

  return axiosInstance;
};

// runs first on app load, if the reload is from a handoff attempt that fails,
// it will attempt again if there are more outbound URLs,
// otherwise it'll load the app normally or show the error page
export const handleAuthRelatedReload = (window: Window) => {
  const urlParams = new URLSearchParams(window.location.search);
  justReturnedFromHandoff = urlParams.has(HANDOFF_ATTEMPT_INDEX_QUERY_PARAM);

  if (urlParams.get(AUTH_FAIL_REASON_QUERY_PARAM) === null) {
    // if there's no auth related fail reason param,
    // then it's either a normla app load or a successful handoff,
    // so clean the url if it was a handoff attempt
    if (justReturnedFromHandoff) {
      window.history.replaceState(null, '', removeHandoffParams(window.location.href));
    }
    return;
  }

  // move on to the next outbound url if there is one
  const attemptIndex = urlParams.get(HANDOFF_ATTEMPT_INDEX_QUERY_PARAM);
  const correlationId = urlParams.get(FAIL_CORRELATION_ID_QUERY_PARAM);

  const nextRedirectUrl = buildRedirectUrl(
    window.location.href,
    Number(attemptIndex) + 1,
    correlationId,
  );

  if (nextRedirectUrl) {
    return navigateAndStopExecution(window, nextRedirectUrl);
  }

  // no more outbound urls to try and handoff failed, show unauthorised page
  window.history.replaceState(null, '', `${import.meta.env.BASE_URL}${APP_ROUTES.UNAUTHORISED}`);
};
