import { expect, test } from '@playwright/test';

test('TC:001 load page and check tabs present', async ({ page }) => {
  await page.goto('./communications', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab', { name: 'PCD Request' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Materials' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Review and Redact' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Communications' })).toBeVisible();
});
