import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseDetailsResponse } from '../mocks/mockCaseDetails';

test.describe('Case Search page', () => {
  test.beforeEach(async ({ page }) => {
    mockRoute(page, '/cases', mockCaseDetailsResponse());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('T-001: expect page loads correctly', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Find a case' })
    ).toBeVisible();
    await expect(
      page.getByText('Search and review a CPS case in England and Wales')
    ).toBeVisible();
  });

  test('T-002: user is able to search a case on page', async ({ page }) => {
    await expect(
      page.getByRole('textbox', { name: 'Search for a case URN' })
    ).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Search for a case URN' })
      .fill('16WW1058825');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(
      page.getByRole('heading', { name: '16WW1058825' })
    ).toBeVisible();
    await expect(page.getByText('Status: Not yet charged')).toBeVisible();
    await expect(page.getByText('Proposed: N/A')).toBeVisible();
  });
});
