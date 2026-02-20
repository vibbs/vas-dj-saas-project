import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('login page has links to register and forgot password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /register|sign up|create account/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot|reset/i })).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    // Should show some kind of error
    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('unauthenticated users are redirected from protected routes', async ({ page }) => {
    await page.goto('/home');
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register-organization');
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('forgot password page renders correctly', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading')).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
