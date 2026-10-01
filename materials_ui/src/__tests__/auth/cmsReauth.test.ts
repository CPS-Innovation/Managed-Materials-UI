import axios, { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type CmsReauth = typeof import('../../auth/cmsReauth');

const PAGE_URL = 'https://polaris.cps.gov.uk/materials-ui/ABC123/42/materials?filter=unused';

type MockWindow = Window & { location: { assign: ReturnType<typeof vi.fn> } };

const mockWindow = (href: string) =>
  ({
    location: { href, search: new URL(href).search, assign: vi.fn() },
    history: { replaceState: vi.fn() },
  }) as unknown as MockWindow;

const loadCmsReauth = async (
  outbound = '/auth-refresh-outbound,/polaris',
  inbound = '/auth-refresh-inbound',
) => {
  vi.stubEnv('VITE_REAUTH_REDIRECT_URL_OUTBOUND', outbound);
  vi.stubEnv('VITE_REAUTH_REDIRECT_URL_INBOUND', inbound);
  vi.resetModules();
  return import('../../auth/cmsReauth');
};

const createGateway = (cmsReauth: CmsReauth, window: Window) => {
  let status = 200;
  const instance = cmsReauth.addCmsReauthInterceptor(
    axios.create({
      adapter: async (config) => {
        const response = { status, statusText: '', headers: {}, config, data: {} };
        if (status >= 400) {
          throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response);
        }
        return response;
      },
    }),
    window,
  );
  const get = (correlationId = 'corr-1') =>
    instance.get('/api/cases/42', { headers: { 'Correlation-Id': correlationId } });

  return { get, respondWith: (newStatus: number) => (status = newStatus) };
};

const settledState = async (value: unknown) => {
  const state = Promise.resolve(value).then(
    () => 'resolved',
    () => 'rejected',
  );
  return Promise.race([state, new Promise((resolve) => setTimeout(() => resolve('pending'), 0))]);
};

const parseRedirect = (window: MockWindow) => {
  const outbound = new URL(window.location.assign.mock.calls[0]?.[0], PAGE_URL);
  const inbound = new URL(outbound.searchParams.get('r')!, PAGE_URL);
  return {
    outbound: `${outbound.origin}${outbound.pathname}`,
    inbound: `${inbound.origin}${inbound.pathname}`,
    correlationId: inbound.searchParams.get('fail-correlation-id'),
    terminationUrl: inbound.searchParams.get('polaris-ui-url'),
  };
};

describe('cmsReauth', () => {
  let cmsReauth: CmsReauth;

  beforeEach(async () => {
    cmsReauth = await loadCmsReauth();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('addCmsReauthInterceptor', () => {
    it('sends the window round the CMS cookie handoff on a 401 and leaves the request pending', async () => {
      const window = mockWindow(PAGE_URL);
      const gateway = createGateway(cmsReauth, window);
      gateway.respondWith(401);

      const state = await settledState(gateway.get('corr-1'));

      expect(state).toBe('pending');
      expect(window.location.assign).toHaveBeenCalledTimes(1);
      expect(parseRedirect(window)).toEqual({
        outbound: 'https://polaris.cps.gov.uk/auth-refresh-outbound',
        inbound: 'https://polaris.cps.gov.uk/auth-refresh-inbound',
        correlationId: 'corr-1',
        terminationUrl: `${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-1`,
      });
    });

    it.each([400, 403, 404, 422, 500])(
      'passes a %i on to the existing error handling',
      async (status) => {
        const window = mockWindow(PAGE_URL);
        const gateway = createGateway(cmsReauth, window);
        gateway.respondWith(status);

        await expect(gateway.get()).rejects.toMatchObject({ status });
        expect(window.location.assign).not.toHaveBeenCalled();
      },
    );

    it('passes successful responses through', async () => {
      const window = mockWindow(PAGE_URL);
      const gateway = createGateway(cmsReauth, window);

      await expect(gateway.get()).resolves.toMatchObject({ status: 200 });
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('returns the user to the same page without stacking up handoff params from an earlier attempt', async () => {
      const window = mockWindow(`${PAGE_URL}&auth-refresh=1&fail-correlation-id=old`);
      const gateway = createGateway(cmsReauth, window);
      gateway.respondWith(401);

      await settledState(gateway.get('corr-2'));

      expect(parseRedirect(window).terminationUrl).toBe(
        `${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-2`,
      );
    });
  });

  describe('handoff endpoints', () => {
    it('come from env, with the outbound endpoints tried in order', async () => {
      const configured = await loadCmsReauth(
        'https://cin3.example/polaris,https://cin4.example/polaris',
        'https://proxy.example/auth-refresh-inbound',
      );

      const window = mockWindow(PAGE_URL);
      const gateway = createGateway(configured, window);
      gateway.respondWith(401);
      await settledState(gateway.get());

      expect(parseRedirect(window)).toMatchObject({
        outbound: 'https://cin3.example/polaris',
        inbound: 'https://proxy.example/auth-refresh-inbound',
      });

      const returned = mockWindow(
        `${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-1&auth-fail-reason=cms-auth-not-valid`,
      );
      await settledState(configured.handleAuthRelatedReload(returned));

      expect(parseRedirect(returned).outbound).toBe('https://cin4.example/polaris');
    });

    it('fall back to the proxy paths when the env vars are not set', async () => {
      const configured = await loadCmsReauth('', '');

      const window = mockWindow(PAGE_URL);
      const gateway = createGateway(configured, window);
      gateway.respondWith(401);
      await settledState(gateway.get());

      expect(parseRedirect(window)).toMatchObject({
        outbound: 'https://polaris.cps.gov.uk/auth-refresh-outbound',
        inbound: 'https://polaris.cps.gov.uk/auth-refresh-inbound',
      });
    });
  });

  describe('loop guard', () => {
    const RETURNED_FROM_HANDOFF_URL = `${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-1`;

    it('does not start another handoff when calls still 401 after returning from one', async () => {
      const window = mockWindow(RETURNED_FROM_HANDOFF_URL);
      cmsReauth.handleAuthRelatedReload(window);
      const gateway = createGateway(cmsReauth, window);
      gateway.respondWith(401);

      await expect(gateway.get()).rejects.toMatchObject({ status: 401 });
      await expect(gateway.get()).rejects.toMatchObject({ status: 401 });
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('starts a new handoff once a call has succeeded since returning from one', async () => {
      const window = mockWindow(RETURNED_FROM_HANDOFF_URL);
      cmsReauth.handleAuthRelatedReload(window);
      const gateway = createGateway(cmsReauth, window);

      await gateway.get();
      gateway.respondWith(401);
      const state = await settledState(gateway.get());

      expect(state).toBe('pending');
      expect(window.location.assign).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleAuthRelatedReload', () => {
    it('leaves a normal app load alone', async () => {
      const window = mockWindow(PAGE_URL);

      expect(await settledState(cmsReauth.handleAuthRelatedReload(window))).toBe('resolved');
      expect(window.history.replaceState).not.toHaveBeenCalled();
      expect(window.location.assign).not.toHaveBeenCalled();
    });

    it('tidies the handoff params out of the address bar after a successful handoff', async () => {
      const window = mockWindow(`${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-1`);

      expect(await settledState(cmsReauth.handleAuthRelatedReload(window))).toBe('resolved');
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', PAGE_URL);
    });

    it('moves on to the next outbound endpoint, without starting the app, when the handoff comes back with a fail reason', async () => {
      const window = mockWindow(
        `${PAGE_URL}&auth-refresh=0&fail-correlation-id=corr-1&auth-fail-reason=cms-auth-not-valid`,
      );

      expect(await settledState(cmsReauth.handleAuthRelatedReload(window))).toBe('pending');
      expect(parseRedirect(window)).toEqual({
        outbound: 'https://polaris.cps.gov.uk/polaris',
        inbound: 'https://polaris.cps.gov.uk/auth-refresh-inbound',
        correlationId: 'corr-1',
        terminationUrl: `${PAGE_URL}&auth-refresh=1&fail-correlation-id=corr-1`,
      });
    });

    it('shows the auth error page once every outbound endpoint has failed', async () => {
      const window = mockWindow(
        `${PAGE_URL}&auth-refresh=1&fail-correlation-id=corr-1&auth-fail-reason=cms-auth-not-valid`,
      );

      expect(await settledState(cmsReauth.handleAuthRelatedReload(window))).toBe('resolved');
      expect(window.location.assign).not.toHaveBeenCalled();
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        `${import.meta.env.BASE_URL}unauthorized`,
      );
    });
  });
});
