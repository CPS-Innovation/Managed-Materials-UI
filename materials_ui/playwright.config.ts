import { defineConfig, devices } from '@playwright/test';

const e2eUrn = process.env.E2E_URN;
const e2eCase = process.env.E2E_CASE;
const e2eRoute = e2eUrn && e2eCase ? `${e2eUrn}/${e2eCase}/` : '';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { outputFolder: "./tests/playwright-report" }],
    ["junit", { outputFile: "./tests/e2e-test-results.xml" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: `http://localhost:3000/materials-ui/${e2eRoute}`,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    navigationTimeout: 60 * 1000,  // 60s for page.goto()
    actionTimeout: 30 * 1000,      // 30s for clicks/fills
  },
  
  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    { name: 'setup', testMatch: /global\.setup\.ts/ },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        ...(process.env.CI ? {} : { channel: 'msedge' }),
        storageState: 'tests/.auth/globalSetup.json'
      },
      dependencies: ['setup']
    }
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/materials-ui',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      // Keep E2E independent from external script availability in CI.
      VITE_GLOBAL_SCRIPT_URL: ''
    }
  }
});