import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Role detail page metadata', () => {
  test('displays employment type and remote badge for a remote role', async ({ page }) => {
    await page.goto('/roles/senior-frontend-engineer');

    await expect(page.getByTestId('role-detail-title')).toHaveText('Senior Frontend Engineer');
    await expect(page.getByTestId('role-detail-department')).toHaveText('Technology');
    await expect(page.getByTestId('role-detail-type')).toHaveText('Full-time');
    await expect(page.getByTestId('role-detail-remote')).toHaveText('Remote');
    await expect(page.getByTestId('role-detail-location')).toHaveText('Remote (US & Canada)');

    const axeResults = await new AxeBuilder({ page })
      .include('[data-testid="role-detail-metadata"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(axeResults.violations).toEqual([]);
  });

  test('displays employment type without remote badge for a non-remote role', async ({ page }) => {
    await page.goto('/roles/clinical-research-scientist');

    await expect(page.getByTestId('role-detail-title')).toHaveText('Clinical Research Scientist');
    await expect(page.getByTestId('role-detail-type')).toHaveText('Full-time');
    await expect(page.getByTestId('role-detail-remote')).toHaveCount(0);
    await expect(page.getByTestId('role-detail-location')).toHaveText('Vancouver, Canada');
  });

  test('displays contract employment type correctly', async ({ page }) => {
    await page.goto('/roles/procurement-analyst');

    await expect(page.getByTestId('role-detail-title')).toHaveText('Procurement Analyst');
    await expect(page.getByTestId('role-detail-type')).toHaveText('Contract');
    await expect(page.getByTestId('role-detail-remote')).toHaveCount(0);
  });
});
