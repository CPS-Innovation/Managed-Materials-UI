import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';

test.describe('Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./materials', { waitUntil: 'domcontentloaded' });
  });
  test('Discard material', async ({ page }) => {
    mockRoute(page, '/case-materials', mockCaseMaterials({ subject: 'test 1' }));
    mockRoute(page, '/material/discard');
    const table = page.getByRole('table');
    const row = table.getByRole('row', { name: 'test 1' });
    await row.getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Action on selection' }).first().click();
    await page.getByRole('menuitem', { name: 'Discard' }).click({ force: true });
    await page.getByRole('radio', { name: 'Attached in error' }).click();
    await page.getByRole('button', { name: 'Save and discard' }).click();
    const succesMessage = page.getByText('Discard successful');
    await expect(succesMessage).toBeVisible();
  });

  test('Rename material', async ({ page }) => {
    mockRoute(page, '/case-materials', mockCaseMaterials({ subject: 'test 1' }));
    const table = page.getByRole('table');
    const row = table.getByRole('row', { name: 'test 1' });
    await row.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Action on selection' }).first().click();
    await page.getByRole('menuitem', { name: 'Rename' }).click();
    await page
      .getByRole('textbox', { name: 'What is the new name of the material?' })
      .fill('New file name');
    await page.getByRole('button', { name: 'Save and close' }).click();
    const succesMessage = page.getByText('Material successfully renamed.');
    await expect(succesMessage).toBeVisible();
  });

  //mark as read
  test('Mark as read', async ({ page }) => {
    mockRoute(page, '/case-materials', mockCaseMaterials({ subject: 'test 1' }));
    const table = page.getByRole('table');
    const row = table.getByRole('row', { name: 'test 1' });
    await row.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Action on selection' }).first().click();
    await page.getByRole('menuitem', { name: 'Mark as unread' }).click();
    const succesMessage = page.getByText('Read status updated');
    await expect(succesMessage).toBeVisible();
  });

  //mark as unread
  test('Mark as unread', async ({ page }) => {
    mockRoute(
      page,
      '/case-materials',
      mockCaseMaterials({ subject: 'test 2', readStatus: 'Unread' }),
    );
    const table = page.getByRole('table');
    const row = table.getByRole('row', { name: 'test 2' });
    await row.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Action on selection' }).first().click();
    await page.getByRole('menuitem', { name: 'Mark as read' }).click();
    const succesMessage = page.getByText('Read status updated');
    await expect(succesMessage).toBeVisible();
  });
});
