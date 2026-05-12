import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockPcdCoreResponse } from '../mocks/pcd/mockPcdCore';
import { mockPcdRequestResponse } from '../mocks/pcd/mockPcdRequest';

test.describe('PCD Request Page', () => {
  test('T-001: page loads list of PCD requests as expected', async ({
    page,
  }) => {
    mockRoute(page, 'pcds/2167259/pcd-request-core', mockPcdCoreResponse());
    mockRoute(page, 'pcd-request', mockPcdRequestResponse());
    await page.goto('./pcd-request/145739');
    await page.waitForRequest('**/case-info/2167259');
    await expect(
      page.getByRole('heading', { name: 'Loading case', includeHidden: true }),
    ).toBeVisible();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });

    await expect(
      page.getByRole('heading', { name: 'Police details' }),
    ).toBeVisible();

    await expect(page.getByText('Case outline')).toBeVisible();
    await expect(
      page.getByText(`Supervising officer's comments`),
    ).toBeVisible();
    await expect(page.getByText('Proposed charges')).toBeVisible();
    await expect(page.getByText('Bail details')).toBeVisible();
    await expect(page.getByText('Materials provided')).toBeVisible();
  });

  test('T-002: should navigate to a specific PCD request when a link is clicked', async ({
    page,
  }) => {
    mockRoute(page, 'pcds/2167259/pcd-request-core', mockPcdCoreResponse());
    mockRoute(page, 'pcd-request', mockPcdRequestResponse());
    await page.goto('./pcd-request/145739');
    await page.waitForRequest('**/case-info/2167259');
    await expect(
      page.getByRole('heading', { name: 'Loading case', includeHidden: true }),
    ).toBeVisible();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByRole('heading', { name: 'Police details' }),
    ).toBeVisible();
    await page.locator(`a:text("01/01/2000")`).click();
    await expect(page.locator('dd').nth(0)).toHaveText(`02/02/2021`);
  });

  test('T-003: should display a message when no PCD requests are available', async ({
    page,
  }) => {
    mockRoute(page, 'pcds/2167259/pcd-request-core', []);
    mockRoute(page, 'pcds/145739/pcd-request', {});
    await page.goto('./pcd-request/145739');
    await page.waitForRequest('**/case-info/2167259');
    expect(
      page
        .getByRole('heading', { name: 'Loading case', includeHidden: true })
        .waitFor({ state: 'attached' }),
    ).toBeTruthy();
    await page
      .getByRole('heading', { name: 'Loading case', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByText('There are no PCD Requests to show.'),
    ).toBeVisible();
  });
});
