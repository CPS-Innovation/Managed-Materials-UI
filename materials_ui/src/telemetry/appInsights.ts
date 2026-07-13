import { ApplicationInsights, ICustomProperties } from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;
const cloudRole = import.meta.env.VITE_APPLICATIONINSIGHTS_CLOUD_ROLE;
const samplingPercentage =
  Number(import.meta.env.VITE_APPLICATIONINSIGHTS_SAMPLING_PERCENTAGE) || 20;

let appInsights: ApplicationInsights | undefined;
let userRole: string | undefined;

const normaliseError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

// A route looks like /<urn>/<caseId>/<page>, sometimes with deeper numeric
// ids (e.g. /materials/8923052). Those identify a specific case/document, so
// we replace them with placeholders before sending telemetry: page views then
// group by route (e.g. /:urn/:caseId/materials) instead of leaking case data.
const CASE_URN_AND_ID = /^\/[^/]+\/[^/]+/; // leading /<urn>/<caseId>
const NUMERIC_ID_SEGMENT = /\/\d+/g; // any /<number> segment

const stripCaseIdsFromRoute = (path: string): string =>
  path.replace(CASE_URN_AND_ID, '/:urn/:caseId').replace(NUMERIC_ID_SEGMENT, '/:id');

export const initTelemetry = () => {
  if (appInsights || !connectionString) return;

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: false,
      enableUnhandledPromiseRejectionTracking: true,
      autoTrackPageVisitTime: true,
    },
  });
  appInsights.loadAppInsights();

  // Sample non-exceptions ourselves so we never drop exceptions. One roll per
  // load keeps a page's telemetry together. Actions (events) are kept too.
  const retainNonException = Math.random() * 100 < samplingPercentage;

  appInsights.addTelemetryInitializer((item) => {
    if (cloudRole) {
      item.tags ??= {};
      item.tags['ai.cloud.role'] = cloudRole;
    }

    if (userRole) {
      item.data ??= {};
      item.data.userRole = userRole;
    }

    if (item.baseType === 'ExceptionData' || item.baseType === 'EventData') {
      return true;
    }

    return retainNonException;
  });
};

export const setTelemetryUserRole = (role: string) => {
  userRole = role;
};

export const trackPageView = (pathname: string) => {
  if (!appInsights) return;
  const name = stripCaseIdsFromRoute(pathname);
  // Manual SPA tracking doesn't refresh operation name; it stays on the first
  // page unless we set it ourselves, so telemetry groups under the wrong route.
  appInsights.context.telemetryTrace.name = name;
  appInsights.trackPageView({ name });
};

export const trackAction = (action: string, properties?: ICustomProperties) =>
  appInsights?.trackEvent({ name: 'UserAction' }, { action, ...properties });

export const trackEvent = (name: string, properties?: ICustomProperties) =>
  appInsights?.trackEvent({ name }, properties);

export const trackException = (error: unknown, properties?: ICustomProperties) =>
  appInsights?.trackException({ exception: normaliseError(error) }, properties);

export const trackMetric = (name: string, average: number, properties?: ICustomProperties) =>
  appInsights?.trackMetric({ name, average }, properties);
