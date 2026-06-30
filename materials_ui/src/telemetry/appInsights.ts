import {
  ApplicationInsights,
  ICustomProperties
} from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env
  .VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;
const cloudRole = import.meta.env.VITE_APPLICATIONINSIGHTS_CLOUD_ROLE;
const samplingPercentage =
  Number(import.meta.env.VITE_APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE) || 20;

let appInsights: ApplicationInsights | undefined;

const normaliseError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

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

  // Sample non-exceptions ourselves so we never drop exceptions. One roll per
  // load keeps a page's telemetry together.
  const retainNonException = Math.random() * 100 < samplingPercentage;

  appInsights.addTelemetryInitializer((item) => {
    if (cloudRole) {
      (item.tags ??= {})['ai.cloud.role'] = cloudRole;
    }

    if (item.baseType === 'ExceptionData') {
      return true;
    }

    return retainNonException;
  });
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
