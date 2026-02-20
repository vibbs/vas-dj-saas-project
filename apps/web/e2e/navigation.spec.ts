import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VAS-DJ/i);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText(/404|not found/i)).toBeVisible();
  });

  test('API docs are accessible', async ({ page }) => {
    const baseApiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';
    await page.goto(`${baseApiUrl}/api/docs/`);
    await expect(page.getByText(/swagger|api/i)).toBeVisible({ timeout: 15000 });
  });
});
