import { test as setup } from '@playwright/test';
import { log } from 'console';
import * as dotenv from 'dotenv';
setup('setup cookie', async ({ browser }) => {
  setup.setTimeout(120_000);
  dotenv.config();

  const username = process.env.E2E_CIN3_USERNAME || '';
  const password = process.env.E2E_CIN3_PASSWORD || '';
  const cmsUrl = process.env.E2E_CMS_COOKIE_URL || '';
  const mslUsername = process.env.E2E_TEST_MS_USERNAME || '';
  const mslPassword = process.env.E2E_TEST_MS_PASSWORD || '';

  const context = await browser.newContext();
  context.setDefaultNavigationTimeout(120_000);
  const page = await context.newPage();

  //sign in to get cookie
  log('sign in to get cookie');
  await page.goto(cmsUrl);
  await page.getByRole('textbox', { name: 'User name' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  const allCookies = await context.cookies();
  const authCookie = allCookies.find(
    (cookie) => cookie.name === 'Cms-Auth-Values'
  );

  if (authCookie) {
    log('Cms-Auth-Value cookie found');
  } else {
    log('Cms-Auth-Value cookie not found');
  }

  //MSAL will redirect to Microsoft login page.
  await page.goto('/materials-ui', { waitUntil: 'domcontentloaded' });
  await page.waitForURL(/login\.microsoftonline\.com|login\.live\.com/);

  const signHeader = page.getByRole('heading', { name: 'Sign in' });
  await signHeader.waitFor({ timeout: 10000 });
  await page.locator('#i0116').fill(mslUsername);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('#i0118').fill(mslPassword);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.context().storageState({ path: 'tests/.auth/globalSetup.json' });
});
