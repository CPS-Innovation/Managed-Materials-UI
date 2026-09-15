import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';
import { mockOchestration } from '../mocks/mockOchestrationReclassify';
import { mockWitness } from '../mocks/mockWitness';

test.beforeEach(async ({ page }) => {
  await mockRoute(page, '/case-materials', mockCaseMaterials());
  await page.goto('./materials', { waitUntil: 'domcontentloaded' });
  await page.waitForRequest('**/case-info/2167259');
  await page
    .getByRole('heading', { name: 'Loading case', includeHidden: true })
    .waitFor({ state: 'detached' });
  const rowFilter = page.getByRole('row').filter({ hasText: 'MG15(CNOI)' }).getByRole('checkbox');
  await rowFilter.check();
  await page.getByRole('button', { name: 'Action on selection' }).first().click();
  await page.getByRole('listitem').filter({ hasText: 'Reclassify' }).click();
});

test('page loads as expected', async ({ page }) => {
  const url = page.url();
  const title = await page.title();
  const mainHeading = page.getByRole('heading', { level: 1 });
  const backLink = page.getByRole('link', { name: 'Back' });
  const firstQuestion = page.getByText('What is the new material classification category?');
  const radios = page.getByRole('radio');
  const submitButton = page.getByRole('button', { name: 'Continue' });
  const cancelLink = page.getByRole('link', { name: 'Cancel' });

  expect(url).toContain('/reclassify');
  expect(title).toBe('Case Materials - Manage Materials and Communications');
  await expect(backLink).toBeVisible();
  await expect(mainHeading).toHaveText('Material category');
  await expect(firstQuestion).toBeVisible();
  await expect(radios).toHaveCount(4);
  await expect(submitButton).toBeVisible();
  await expect(cancelLink).toBeVisible();
});

test.describe('button interactions', () => {
  test('click back link', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('link', { name: 'Back' }).click();

    const url = page.url();
    expect(url).toContain('/materials');
  });

  test('click cancel link', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('link', { name: 'Cancel' }).click();

    const url = page.url();
    expect(url).toContain('/materials');
  });
});

//validation
test.describe('validation', () => {
  test('no classification type selected', async ({ page }) => {
    await page.getByRole('button', { name: 'Continue' }).click();

    const errorMessage = page.getByRole('link', {
      name: 'Choose a new material classification category',
    });
    await expect(errorMessage).toBeVisible();

    await page.getByRole('radio').first().check();
    await expect(errorMessage).not.toBeVisible();
  });
  test('statement errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Statement' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const dateErrorMessage = page.getByRole('link', { name: 'Select if statement has a date' });
    const statementNumberErrorMessage = page.getByRole('link', {
      name: 'Enter a statement number',
    });
    const witnessErrorMessage = page.getByRole('link', { name: 'Choose a witness' });
    await expect(dateErrorMessage).toBeVisible();
    await expect(statementNumberErrorMessage).toBeVisible();
    await expect(witnessErrorMessage).toBeVisible();
  });
  test('exhibit errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Exhibit' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const exhibitTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type',
    });
    const itemErrorMessage = page.getByRole('link', { name: 'Enter the item' });
    const exhibitRefErrorMessage = page.getByRole('link', { name: 'Enter the exhibit reference' });
    await expect(exhibitTypeErrorMessage).toBeVisible();
    await expect(itemErrorMessage).toBeVisible();
    await expect(exhibitRefErrorMessage).toBeVisible();
  });
  test('MG Forms errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'MG Forms' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const formTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type',
    });
    await expect(formTypeErrorMessage).toBeVisible();
  });
  test('other errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Other' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const otherTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type',
    });
    await expect(otherTypeErrorMessage).toBeVisible();
  });
});

test.describe('form submission', () => {
  test('reclassify MG forms', async ({ page }) => {
    await mockRoute(page, 'materials/8836399/reclassify-complete', mockOchestration());

    await page.getByRole('radio', { name: 'MG Forms' }).check();
    await page.getByLabel('What is the material').selectOption('1064');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(page.getByText('Material reclassified successfully')).toBeVisible();
  });

  test('statement reclassify with witness', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(page, 'materials/8836399/reclassify-complete', mockOchestration());
    await page.unroute('api/case-materials');
    await mockRoute(
      page,
      'api/case-materials',
      mockCaseMaterials({
        category: 'Statement',
        type: 'MG11',
        witnessId: 2794967,
        documentTypeId: 1031,
      }),
    );

    await page.getByRole('radio', { name: 'Statement' }).check();
    await page.waitForLoadState('domcontentloaded');

    const witnessSelect = page.getByLabel('Who is the witness');
    await expect(witnessSelect.getByRole('option')).toHaveText(['Select witness', 'Test Witness']);
    await witnessSelect.selectOption('Test Witness');
    await page.getByLabel('No').check();
    await page.getByText('Statement number').fill('1');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(page.getByText('Material reclassified successfully')).toBeVisible();
  });

  test('reclassify exhibit', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(page, 'api/materials/8836399/reclassify-complete', mockOchestration());

    await page.unroute('api/case-materials');

    await mockRoute(
      page,
      'api/case-materials',
      mockCaseMaterials({
        id: 4242662,
        type: 'MG15',
        category: 'Exhibit',
        originalFileName: 'Case Action Plan 4 (test)',
        subject: 'Test action plan',
        materialId: 4242662,
        documentTypeId: 1062,
      }),
    );
    await page.getByRole('radio', { name: 'Exhibit' }).check();
    await page.getByLabel('What is the material classification type?').selectOption('MG15(ROTI)');
    await page.getByRole('textbox', { name: 'Item' }).fill('Item 1');
    await page.getByRole('textbox', { name: 'Exhibit reference' }).fill('AT-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('heading', { name: 'Please wait...', includeHidden: true }),
    ).toBeVisible();
    await expect(page.getByText('Material reclassified successfully')).toBeVisible();
  });

  test('reclassify other', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(page, 'api/materials/4242662/reclassify-complete', mockOchestration());

    await page.unroute('api/case-materials');

    await mockRoute(
      page,
      'api/case-materials',
      mockCaseMaterials({
        id: 4242662,
        type: 'ABE',
        category: 'Exhibit',
        originalFileName: 'Case Action Plan 4 (test)',
        subject: 'Test action plan',
        materialId: 4242662,
        documentTypeId: 1062,
      }),
    );
    await mockRoute(page, 'api/materials/8836399/reclassify-complete', mockOchestration());

    await page.getByRole('radio', { name: 'Other' }).check();
    await page.getByLabel('What is the material classification type?').selectOption('1201');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(page.getByText('Material reclassified successfully')).toBeVisible();
  });
});
