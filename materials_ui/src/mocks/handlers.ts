import { http, HttpResponse } from 'msw';
import { POLARIS_GATEWAY_URL } from '../constants/url';

export const handlers = [
  http.post(`${POLARIS_GATEWAY_URL}/api/hk-logger`, async ({ request }) => {
    const body = (await request.json()) as { logLevel: number; message: string };

    console.log('HK Logger mocked');
    console.table(body);

    return HttpResponse.json({}, { status: 200 });
  }),
];
