import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Department pages', () => {
  test('navigates to department page from role detail page and displays matching roles', async ({ page }) => {
    await page.goto('/roles/senior-frontend-engineer');

    const departmentLink = page.getByTestId('role-department-link');
    await expect(departmentLink).toBeVisible();
    await expect(departmentLink).toHaveText('Technology');

    await departmentLink.click();
    await expect(page).toHaveURL(/\/departments\/technology\/?$/);
    await expect(page.getByTestId('department-title')).toHaveText('Technology');

    const cards = page.getByTestId('role-card');
    await expect(cards).toHaveCount(2);

    for (const card of await cards.all()) {
      await expect(card.getByTestId('role-department')).toHaveText('Technology');
    }

    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test('prerenders department pages with special characters in name', async ({ page }) => {
    await page.goto('/departments/research-and-development');

    await expect(page.getByTestId('department-title')).toHaveText('Research & Development');
    await expect(page.getByTestId('role-card')).toBeVisible();
  });
});
