import { expect, test } from '@playwright/test';
import { mockRoute, mockServerError } from '../helpers';
import { mockPcdReviewReviewDataResponse } from '../mocks/pcd/mockPcdReviewData';
import { mockPcdReviewHistoryDataResponse } from '../mocks/pcd/mockPcdReviewHistory';
import { mockPcdReviewInitialDataResponse } from '../mocks/pcd/mockPcdReviewInitial';

test.describe('PCD Review', () => {
  test('T-001: page loads Initial Review and displays all main sections', async ({
    page,
  }) => {
    await mockRoute(
      page,
      'cases/2167259/history',
      mockPcdReviewHistoryDataResponse(),
    );
    await mockRoute(
      page,
      'cases/2167259/history/4380514/initial-review',
      mockPcdReviewInitialDataResponse(),
    );
    await mockRoute(
      page,
      'cases/2167259/history/4380522/pre-charge-decision',
      mockPcdReviewReviewDataResponse(),
    );

    await page.goto('./pcd-review', { waitUntil: 'domcontentloaded' });
    await page.waitForRequest('**/case-info/2167259');
    await expect(
      page.getByRole('heading', { name: 'Loading case', includeHidden: true }),
    ).toBeVisible();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });

    // Main headings
    await expect(
      page.getByRole('heading', { name: 'Initial Review' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Case Headline ' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Charging Decision & Advice' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Further action agreed for codes A, B, B2, H, I, J',
      }),
    ).toBeVisible();

    // Table headings
    await expect(
      page.getByRole('columnheader', { name: 'Suspect' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Charging code' }),
    ).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: 'Advice' }),
    ).toBeVisible();
    // Definition list items
    await expect(page.getByText('Review type:')).toBeVisible();
    await expect(page.getByText('Prosecutor name:')).toBeVisible();
    await expect(page.getByText('Review date:')).toBeVisible();
    await expect(page.getByText('Action type:')).toBeVisible();
    await expect(page.getByText('Action date:')).toBeVisible();
    await expect(page.getByText('Return bail date:')).toBeVisible();
  });

  test('T-002: should show error message when server returns 401', async ({
    page,
  }) => {
    mockServerError(page, 'cases/2167259/history');
    mockServerError(page, 'cases/2167259/history/initial-review');
    mockServerError(page, 'cases/2167259/history/2167259/pre-charge-decision');

    await page.goto('./pcd-review', { waitUntil: 'domcontentloaded' });
    await page.waitForRequest('**/case-info/2167259');
    await expect(
      page.getByRole('heading', { name: 'Loading case', includeHidden: true }),
    ).toBeVisible();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByRole('heading', { name: 'Authentication Error' }),
    ).toBeVisible();
  });

  test('T-003: Review has not been completed message shown if no data is returned', async ({
    page,
  }) => {
    await mockRoute(page, 'cases/2167259/history', []);
    await mockRoute(page, 'cases/2167259/history/initial-review', {});

    await page.goto('./pcd-review', { waitUntil: 'domcontentloaded' });
    await page.waitForRequest('**/case-info/2167259');
    await expect(
      page.getByRole('heading', { name: 'Loading case', includeHidden: true }),
    ).toBeVisible();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByText('A Review has not yet been completed for this case.'),
    ).toBeVisible();
  });
});
