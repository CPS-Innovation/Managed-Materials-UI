import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';

test.describe('Review redact page', () => {
  test.beforeEach(async ({ page }) => {
    const loadingDocumentHeader = page.getByRole('heading', {
      name: 'Loading documents',
      includeHidden: true
    });
    await mockRoute(page, '/case-materials', mockCaseMaterials());
    await page.goto('./review-and-redact', { waitUntil: 'domcontentloaded' });
    await page.waitForRequest('**/case-info/2167259');
    await expect(loadingDocumentHeader).toBeVisible();
    await loadingDocumentHeader.waitFor({ state: 'detached' });
  });

  test('T-001: page loads correctly with materials', async ({ page }) => {
    await expect(
      page.getByRole('searchbox', { name: 'Search within material' })
    ).toBeVisible();
    await expect(page.getByText('Statements')).toBeVisible();
    await expect(page.getByText('Exhibits')).toBeVisible();
    await expect(page.getByText('MG forms')).toBeVisible();
    await expect(page.getByText('Other documents')).toBeVisible();
    await expect(page.getByText('Defendant pre cons')).toBeVisible();
    await expect(page.getByText('Unused material')).toBeVisible();
  });

  test('T-002: If no searches are found messages is displayed to user', async ({
    page
  }) => {
    await expect(
      page.getByRole('searchbox', { name: 'Search within material' })
    ).toBeVisible();
    await page
      .getByRole('searchbox', { name: 'Search within material' })
      .fill('test search');
    await page
      .getByRole('heading', { name: 'Loading documents', includeHidden: true })
      .waitFor({ state: 'detached' });
    await page.getByRole('button', { name: 'Search' }).click();
    await page
      .getByRole('heading', {
        name: 'Loading search results',
        includeHidden: true
      })
      .waitFor({ state: 'detached' });
    await expect(page.getByText('No results.')).toBeVisible();
  });

  test('T-003: User is able to open all sections', async ({ page }) => {
    await page.getByRole('button', { name: 'Open all sections' }).click();
    const containers = page.locator('.govuk-accordion-content-wrapper');
    await expect(containers).toHaveCount(6);
  });
});
