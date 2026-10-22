import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('High-contrast mode toggle and persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test so each test starts in a clean default state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('toggles high-contrast mode on and off via button click', async ({ page }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('contrast-status')).toHaveText('Off');

    // Initially, high-contrast class and attribute should not be present
    const isInitiallyHighContrast = await page.evaluate(() =>
      document.documentElement.classList.contains('high-contrast'),
    );
    expect(isInitiallyHighContrast).toBe(false);

    // Toggle on
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('contrast-status')).toHaveText('On');

    const isHighContrastNow = await page.evaluate(
      () =>
        document.documentElement.classList.contains('high-contrast') &&
        document.documentElement.getAttribute('data-high-contrast') === 'true',
    );
    expect(isHighContrastNow).toBe(true);

    // Verify background is pure black in high-contrast mode
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // Toggle off
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('contrast-status')).toHaveText('Off');

    const isHighContrastAfter = await page.evaluate(() =>
      document.documentElement.classList.contains('high-contrast'),
    );
    expect(isHighContrastAfter).toBe(false);
  });

  test('persists high-contrast preference across page reloads', async ({ page }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // Reload page
    await page.reload();

    const toggleAfterReload = page.getByTestId('high-contrast-toggle');
    await expect(toggleAfterReload).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('contrast-status')).toHaveText('On');

    const isHighContrast = await page.evaluate(
      () =>
        document.documentElement.classList.contains('high-contrast') &&
        document.documentElement.getAttribute('data-high-contrast') === 'true',
    );
    expect(isHighContrast).toBe(true);

    const storedValue = await page.evaluate(() => localStorage.getItem('high-contrast'));
    expect(storedValue).toBe('true');
  });

  test('persists high-contrast preference across navigation', async ({ page }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // Navigate to /about using exact name match
    await page.getByRole('link', { name: 'About Caldova', exact: true }).click();
    await expect(page).toHaveURL(/\/about/);

    const aboutToggle = page.getByTestId('high-contrast-toggle');
    await expect(aboutToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('contrast-status')).toHaveText('On');

    const isAboutHighContrast = await page.evaluate(
      () =>
        document.documentElement.classList.contains('high-contrast') &&
        document.documentElement.getAttribute('data-high-contrast') === 'true',
    );
    expect(isAboutHighContrast).toBe(true);

    // Navigate back to Open roles using exact name match
    await page.getByRole('link', { name: 'Open roles', exact: true }).click();
    await expect(page).toHaveURL('/');
    const firstRoleCard = page.getByTestId('role-card').first();
    await firstRoleCard.click();
    await expect(page.getByTestId('apply-form')).toBeVisible();

    const isDetailHighContrast = await page.evaluate(
      () =>
        document.documentElement.classList.contains('high-contrast') &&
        document.documentElement.getAttribute('data-high-contrast') === 'true',
    );
    expect(isDetailHighContrast).toBe(true);
  });

  test('is keyboard accessible and activates with Enter and Space', async ({ page }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await toggle.focus();
    await expect(toggle).toBeFocused();

    // Activate using Enter key
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('contrast-status')).toHaveText('On');

    // Deactivate using Space key
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('contrast-status')).toHaveText('Off');
  });

  test('meets WCAG 2.1 AA contrast and accessibility standards in high-contrast mode', async ({
    page,
  }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
