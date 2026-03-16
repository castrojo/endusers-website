import { test, expect } from '@playwright/test';

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/endusers-website/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('theme toggle button exists', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle changes theme', async ({ page }) => {
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('theme persists across reload', async ({ page }) => {
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
