import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Derive the expected posting count from the job content collection so this
// assertion stays correct as roles are added or removed.
const jobsDir = fileURLToPath(new URL('../src/content/jobs', import.meta.url));
const expectedRoleCount = readdirSync(jobsDir).filter((f) => f.endsWith('.md')).length;

test.describe('Open roles listing', () => {
  test('shows the roles grid with all postings', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Open roles' })).toBeVisible();

    const grid = page.getByTestId('roles-grid');
    await expect(grid).toBeVisible();
    await expect(page.getByTestId('role-card')).toHaveCount(expectedRoleCount);
  });

  test('displays careers summary with total open roles and department count', async ({ page }) => {
    await page.goto('/');
    const summary = page.getByTestId('careers-summary');
    await expect(summary).toBeVisible();

    const totalRoles = page.getByTestId('summary-total-roles');
    await expect(totalRoles).toHaveText(String(expectedRoleCount));

    const totalDepartments = page.getByTestId('summary-total-departments');
    await expect(totalDepartments).toHaveText('10');
  });

  test('filters roles by department', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('department-filter').selectOption({ label: 'Technology' });

    await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(2);
    await expect(
      page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: 'Senior Frontend Engineer', exact: true }),
      }),
    ).toBeVisible();
    await expect(
      page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: 'Financial Analyst', exact: true }),
      }),
    ).toBeHidden();
  });

  test('filters roles by location', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('location-filter').selectOption({
      label: 'Remote (US & Canada)',
    });

    await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(2);
    await expect(
      page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: 'Senior Frontend Engineer', exact: true }),
      }),
    ).toBeVisible();
    await expect(
      page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: 'Financial Analyst', exact: true }),
      }),
    ).toBeHidden();
  });

  test('combines filters and resets to all roles', async ({ page }) => {
    await page.goto('/');
    const departmentFilter = page.getByTestId('department-filter');
    const locationFilter = page.getByTestId('location-filter');

    await departmentFilter.selectOption({ label: 'Finance' });
    await locationFilter.selectOption({ label: 'Woodinville, WA, USA' });
    await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(1);
    await expect(
      page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: 'Financial Analyst', exact: true }),
      }),
    ).toBeVisible();

    await page.getByTestId('filter-reset').click();
    await expect(departmentFilter).toHaveValue('');
    await expect(locationFilter).toHaveValue('');
    await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(
      expectedRoleCount,
    );
  });

  test('shows an empty state when no roles match both filters', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('department-filter').selectOption({ label: 'Finance' });
    await page.getByTestId('location-filter').selectOption({
      label: 'London, United Kingdom',
    });

    await expect(page.locator('[data-testid="role-card"]:visible')).toHaveCount(0);
    await expect(page.getByTestId('filtered-empty-state')).toBeVisible();
    await expect(page.getByTestId('empty-state-text')).toHaveText(
      'No roles match these filters. Try changing or resetting your filters.',
    );
  });

  test('links through to a role detail page', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.getByTestId('role-card').first();
    const title = await firstCard.getByTestId('role-title').textContent();
    await firstCard.click();
    await expect(page.getByTestId('role-detail-title')).toHaveText(title!.trim());
    await expect(page.getByTestId('apply-form')).toBeVisible();
  });

  for (const { title, location } of [
    { title: 'Senior Frontend Engineer', location: 'Remote (US & Canada)' },
    { title: 'Financial Analyst', location: 'Woodinville, WA, USA' },
  ]) {
    test(`keeps ${title} location on details, not starter cards`, async ({ page }) => {
      await page.goto('/');
      const card = page.getByTestId('role-card').filter({
        has: page.getByRole('heading', { name: title, exact: true }),
      });

      await expect(card).toBeVisible();
      await expect(card.getByText(location, { exact: true })).toHaveCount(0);
      await card.click();
      await expect(page.getByText(location, { exact: true })).toBeVisible();
    });
  }

  test('has no automatically detectable accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
