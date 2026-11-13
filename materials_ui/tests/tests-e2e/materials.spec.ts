import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';

test.describe('Materials page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./materials', { waitUntil: 'domcontentloaded' });
  });

  test('T-001: page loads list of materials', async ({ page }) => {
    mockRoute(page, '/documents', mockCaseMaterials([{ subject: 'test 1' }]));
    await page.waitForRequest('**/case-info/2167259');
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });

  test('T-002: page shows no materials text if no materials are displayed', async ({ page }) => {
    mockRoute(page, '/documents', []);

    // no materials
    await page.waitForSelector('tbody'); // Ensure table exists first
    await expect(page.locator('tbody')).toContainText(
      'There are no materials that match your selection for this case',
    );
  });

  test('T-003: user is able to filter by used status', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([
        { subject: 'MG11 Shelagh  Mc Love Undated', type: 'Statement', status: 'Used' },
      ]),
    );
    await page.waitForRequest('**/case-info/2167259');

    //used status
    await page.getByTestId('status-Used').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('MG11 Shelagh  Mc Love Undated', { exact: true })).toBeVisible();
  });

  test('T-004: user is able to filter by unused status', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([
        { subject: 'Stmt: Twob DCPTWIFVIC', category: 'Statement', status: 'Unused' },
      ]),
    );
    await page.waitForRequest('**/case-info/2167259');
    //nused status
    await page.getByTestId('status-Unused').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('Stmt: Twob DCPTWIFVIC', { exact: true })).toBeVisible();
  });

  test('T-005: user is able to filter by statement category', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([{ subject: 'test 1', category: 'Statement' }]),
    );
    await page.waitForRequest('**/case-info/2167259');
    // statement
    await page.getByTestId('category-Statement').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });

  test('T-006: user is able to filter by exhibit', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([{ subject: 'test 1', category: 'Exhibit', status: 'Used' }]),
    );
    await page.waitForRequest('**/case-info/2167259');
    // exhibit
    await page.getByTestId('category-Exhibit').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });

  test('T-007: user is able to filter by category', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([{ subject: 'test 1', category: 'Other Material', status: 'Used' }]),
    );
    await page.waitForRequest('**/case-info/2167259');
    //other material
    await page.getByTestId('category-Other Material').check();
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('test 1', { exact: true })).toBeVisible();
  });

  test('T-008: user is able to hide filter', async ({ page }) => {
    mockRoute(page, '/documents', mockCaseMaterials());
    await page.getByRole('button', { name: 'Hide filters' }).click();
    await expect(page.getByLabel('Material name')).toBeHidden();
    await page.getByRole('button', { name: 'Show filters' }).click();
    await expect(page.getByLabel('Material name')).toBeVisible();
  });

  // search
  test('T-009: user is able to search materials', async ({ page }) => {
    mockRoute(
      page,
      '/documents',
      mockCaseMaterials([{ subject: 'Case Action Plan 4', type: 'Statement', status: 'None' }]),
    );
    await page.waitForRequest('**/case-info/2167259');
    await page.getByRole('searchbox', { name: 'Material name' }).fill('Case Action');
    await page.getByTestId('applyFiltersButton').click();
    await expect(page.getByText('Case Action Plan 4', { exact: true })).toBeVisible();
  });
});
