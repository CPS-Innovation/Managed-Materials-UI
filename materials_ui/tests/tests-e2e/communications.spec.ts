import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';

test.describe('Communications page', () => {
  test.beforeEach(async ({ page }) => {
    await mockRoute(page, '/case-materials', mockCaseMaterials());
    await page.goto('./communications', { waitUntil: 'domcontentloaded' });
    await page.waitForRequest('**/case-info/2167259');
  });
  test('T-001: page loads list of Communications', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'MG7 SMITH Will (Redacted)',
        type: 'DCF',
        category: 'Communication'
      })
    );

    await expect(
      page.getByText('MG7 SMITH Will (Redacted)', { exact: true })
    ).toBeVisible();
  });

  test('T-002: page shows no communications text if no communications are displayed', async ({
    page
  }) => {
    mockRoute(page, '/case-materials', mockCaseMaterials({}));

    // no materials
    await page.waitForSelector('tbody'); // Ensure table exists first
    await page.route('/case-materials', (route) => route.abort());
    expect(
      page.getByText(
        'There are no communications that match your selection for this case'
      )
    ).toBeVisible();
  });

  //in/out filter
  test('T-003: user is able to filter by in/out', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'MG7 SMITH Will (Redacted)',
        type: 'DCF',
        category: 'Communication',
        direction: 'Incoming'
      })
    );
    await page.getByTestId('direction-Incoming').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(
      page.getByText('MG7 SMITH Will (Redacted)', { exact: true })
    ).toBeVisible();
  });

  //comms type filter
  test('T-004: user is able to filter by comms type', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'test 1',
        type: 'DCF',
        category: 'Communication',
        method: 'Bundle'
      })
    );

    await page.getByTestId('method-Bundle').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });
  // comms with filter
  test('T-005: user is able to filter by comms with', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'test 2',
        type: 'DCF',
        category: 'Communication',
        method: 'Police'
      })
    );
    await page.getByTestId('checkbox-party-Police').click();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 2', { exact: true })).toBeVisible();
  });
  // type filter
  test('T-006: user is able to filter by type', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'test 3',
        type: 'Meeting',
        category: 'Communication',
        method: 'Police'
      })
    );

    await page.getByTestId('type-Meeting').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 3', { exact: true })).toBeVisible();
  });

  // hide filter
  test('T-007: user is able to hide filter', async ({ page }) => {
    await page.getByRole('button', { name: 'Hide filter' }).click();
    await expect(page.getByText('FiltersClear filtersSearch')).toBeHidden();
    await page.getByRole('button', { name: 'Show filter' }).click();
    await expect(page.getByText('FiltersClear filtersSearch')).toBeVisible();
  });

  // search
  test('T-008: user is able to search communications', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({
        subject: 'test 1',
        type: 'Meeting',
        category: 'Communication',
        method: 'Police'
      })
    );
    await page
      .getByRole('searchbox', { name: 'Search communications' })
      .fill('test 1');
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });
});
