import {
  ApplicationInsights,
  ICustomProperties
} from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env
  .VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;

let appInsights: ApplicationInsights | undefined;

const normaliseError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

// Initialise once per app load. No-op if already initialised or no connection
// string is configured (e.g. local dev / tests).
export const initTelemetry = () => {
  if (appInsights || !connectionString) return;

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: false,
      enableUnhandledPromiseRejectionTracking: true
    }
  });
  appInsights.loadAppInsights();
};

export const trackPageView = (pathname: string) => {
  if (!appInsights) return;
  // Manual SPA tracking doesn't refresh operation name; it stays on the first
  // page unless we set it ourselves, so telemetry groups under the wrong route.
  appInsights.context.telemetryTrace.name = pathname;
  appInsights.trackPageView({ name: pathname });
};

export const trackEvent = (name: string, properties?: ICustomProperties) =>
  appInsights?.trackEvent({ name }, properties);

export const trackException = (
  error: unknown,
  properties?: ICustomProperties
) =>
  appInsights?.trackException({ exception: normaliseError(error) }, properties);

export const trackMetric = (
  name: string,
  average: number,
  properties?: ICustomProperties
) => appInsights?.trackMetric({ name, average }, properties);
