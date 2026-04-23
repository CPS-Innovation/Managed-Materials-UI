import { expect, test } from '@playwright/test';
import { mockRoute } from '../helpers';
import { mockCaseMaterials } from '../mocks/mockCaseMaterials';
import { mockDefendants } from '../mocks/mockDefendents';
import { mockOchestration } from '../mocks/mockOchestrationReclassify';
import { mockWitness } from '../mocks/mockWitness';

test.beforeEach(async ({ page }) => {
  await mockRoute(page, '/case-materials', mockCaseMaterials());
  await page.goto('./materials', { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('heading', { name: 'Loading case', includeHidden: true })
    .waitFor({ state: 'detached' });
  const rowFilter = page
    .getByRole('row')
    .filter({ hasText: 'MG15(CNOI)' })
    .getByRole('checkbox');
  await rowFilter.check();
  await page
    .getByRole('button', { name: 'Action on selection' })
    .first()
    .click();
  await page.getByRole('listitem').filter({ hasText: 'Reclassify' }).click();
});

test('page loads as expected', async ({ page }) => {
  const url = page.url();
  const title = await page.title();
  const mainHeading = page.getByRole('heading', { level: 1 });
  const backLink = page.getByRole('link', { name: 'Back' });
  const firstQuestion = page.getByText(
    'What is the new material classification category?'
  );
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
      name: 'Choose a new material classification category'
    });
    await expect(errorMessage).toBeVisible();

    await page.getByRole('radio').first().check();
    await expect(errorMessage).not.toBeVisible();
  });
  test('statement errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Statement' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const dateErrorMessage = page.getByRole('link', {
      name: 'Select if statement has a date'
    });
    const statementNumberErrorMessage = page.getByRole('link', {
      name: 'Enter a statement number'
    });
    const witnessErrorMessage = page.getByRole('link', {
      name: 'Choose a witness'
    });
    await expect(dateErrorMessage).toBeVisible();
    await expect(statementNumberErrorMessage).toBeVisible();
    await expect(witnessErrorMessage).toBeVisible();
  });
  test('stateemnt add witness errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Statement' }).check();
    await page
      .getByLabel('Who is the witness')
      .selectOption('Witness not on the list - add witness');

    await page.getByLabel('No').check();
    await page.getByText('Statement number').fill('1');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    const firstNameErorMessage = page.getByRole('link', {
      name: 'Enter the first name'
    });
    const lastNameErrorMessage = page.getByRole('link', {
      name: 'Enter the last name'
    });
    const contestedIssueErrorMessage = page.getByRole('link', {
      name: 'Enter the contested issue'
    });
    const requestErrorMessage = page.getByRole('link', {
      name: 'Choose what you want to request'
    });
    const defendantErrorMessage = page.getByRole('link', {
      name: 'Select a defendant the action plan relates to'
    });
    const actionPlanErrorMessage = page.getByRole('link', {
      name: 'Enter the action plan description'
    });
    const dateNeededErrorMessage = page.getByRole('link', {
      name: 'Enter a valid date in the future'
    });
    const followUpErrorMessage = page.getByRole('link', {
      name: 'Select if you want to add a follow up'
    });
    await expect(firstNameErorMessage).toBeVisible();
    await expect(lastNameErrorMessage).toBeVisible();
    await expect(contestedIssueErrorMessage).toBeVisible();
    await expect(requestErrorMessage).toBeVisible();
    await expect(defendantErrorMessage).toBeVisible();
    await expect(actionPlanErrorMessage).toBeVisible();
    await expect(dateNeededErrorMessage).toBeVisible();
    await expect(followUpErrorMessage).toBeVisible();
  });
  test('exhibit errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Exhibit' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const exhibitTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type'
    });
    const itemErrorMessage = page.getByRole('link', { name: 'Enter the item' });
    const exhibitRefErrorMessage = page.getByRole('link', {
      name: 'Enter the exhibit reference'
    });
    await expect(exhibitTypeErrorMessage).toBeVisible();
    await expect(itemErrorMessage).toBeVisible();
    await expect(exhibitRefErrorMessage).toBeVisible();
  });
  test('MG Forms errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'MG Forms' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const formTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type'
    });
    await expect(formTypeErrorMessage).toBeVisible();
  });
  test('other errors', async ({ page }) => {
    await page.getByRole('radio', { name: 'Other' }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    const otherTypeErrorMessage = page.getByRole('link', {
      name: 'Choose a material classification type'
    });
    await expect(otherTypeErrorMessage).toBeVisible();
  });
});

test.describe('form submission', () => {
  test('reclassify MG forms', async ({ page }) => {
    await mockRoute(
      page,
      'material/8836399/reclassify-complete',
      mockOchestration()
    );

    await page.getByRole('radio', { name: 'MG Forms' }).check();
    await page.getByLabel('What is the material').selectOption('1064');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByText('Material reclassified successfully')
    ).toBeVisible();
  });

  test('statement reclassify with witness', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(
      page,
      'material/8836399/reclassify-complete',
      mockOchestration()
    );
    await page.unroute('api/case-materials');
    await mockRoute(
      page,
      'api/case-materials',
      mockCaseMaterials({
        category: 'Statement',
        type: 'MG11',
        witnessId: 2794967,
        documentTypeId: 1031
      })
    );

    await page.getByRole('radio', { name: 'Statement' }).check();
    await page.waitForLoadState('domcontentloaded');
    await page.getByLabel('Who is the witness').selectOption('Test Witness');
    await page.getByLabel('No').check();
    await page.getByText('Statement number').fill('1');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByText('Material reclassified successfully')
    ).toBeVisible();
  });

  test('statement reclassify with add witness', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(
      page,
      'material/8836399/reclassify-complete',
      mockOchestration()
    );
    await page.unroute('api/case-materials');
    await mockRoute(
      page,
      'api/case-materials',
      mockCaseMaterials({
        category: 'Statement',
        type: 'MG11',
        witnessId: 2794967,
        documentTypeId: 1031
      })
    );
    await mockRoute(page, 'case-defendants?caseId=2167259', mockDefendants());
    await page.getByRole('radio', { name: 'Statement' }).check();
    await page.waitForLoadState('domcontentloaded');
    await page
      .getByLabel('Who is the witness')
      .selectOption('Witness not on the list - add witness');

    await page.getByLabel('No').check();
    await page.getByText('Statement number').fill('1');
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('textbox', { name: 'First name' }).fill('John');
    await page.getByRole('textbox', { name: 'Last name' }).fill('Doe');
    await page
      .getByRole('textbox', { name: 'Contested issue' })
      .fill('Contested issue');
    await page
      .getByRole('radio', { name: 'Key witness details', exact: true })
      .check();
    await page
      .getByLabel('Select the defendant the action plan relates to')
      .selectOption('Will SMITH');
    await page
      .getByRole('textbox', { name: 'Describe the action plan' })
      .fill('This is a action plan');
    await page.getByRole('textbox', { name: 'Date needed' }).fill('2029-01-31');
    await page.getByRole('radio', { name: 'No', exact: true }).check();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });

    await expect(
      page.getByText('Material reclassified and witness added successfully.')
    ).toBeVisible();
  });

  test('reclassify exhibit', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(
      page,
      'api/material/8836399/reclassify-complete',
      mockOchestration()
    );

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
        documentTypeId: 1062
      })
    );
    await mockRoute(
      page,
      'api/case-defendants?caseId=2167259',
      mockDefendants()
    );
    await page.getByRole('radio', { name: 'Exhibit' }).check();
    await page
      .getByLabel('What is the material classification type?')
      .selectOption('MG15(ROTI)');
    await page.getByRole('textbox', { name: 'Item' }).fill('Item 1');
    await page
      .getByRole('textbox', { name: 'Exhibit reference' })
      .fill('AT-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByRole('heading', { name: 'Please wait...', includeHidden: true })
    ).toBeVisible();
    await expect(
      page.getByText('Material reclassified successfully')
    ).toBeVisible();
  });

  test('reclassify other', async ({ page }) => {
    await mockRoute(page, 'case-witnesses?caseId=2167259', mockWitness());
    await mockRoute(
      page,
      'api/material/4242662/reclassify-complete',
      mockOchestration()
    );

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
        documentTypeId: 1062
      })
    );
    await mockRoute(
      page,
      'api/case-defendants?caseId=2147043',
      mockDefendants()
    );

    await mockRoute(
      page,
      'api/material/8836399/reclassify-complete',
      mockOchestration()
    );

    await page.getByRole('radio', { name: 'Other' }).check();
    await page
      .getByLabel('What is the material classification type?')
      .selectOption('1201');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page
      .getByRole('heading', { name: 'Please wait..', includeHidden: true })
      .waitFor({ state: 'detached' });
    await expect(
      page.getByText('Material reclassified successfully')
    ).toBeVisible();
  });
});
