import { test, expect } from '@playwright/test';

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/endusers-website/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.member-card', { timeout: 10000 });
  });

  test('"/" focuses search', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('"s" focuses search', async ({ page }) => {
    await page.keyboard.press('s');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('"?" opens keyboard help modal', async ({ page }) => {
    await page.keyboard.press('?');
    const modal = page.locator('#keyboard-help-modal');
    await expect(modal).toBeVisible();
  });

  test('"t" toggles theme', async ({ page }) => {
    const html = page.locator('html');
    const themeBefore = await html.getAttribute('data-theme');
    await page.keyboard.press('t');
    const themeAfter = await html.getAttribute('data-theme');
    expect(themeAfter).not.toBe(themeBefore);
  });

  test('Escape closes keyboard help modal', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('#keyboard-help-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#keyboard-help-modal')).not.toBeVisible();
  });

  test('number keys 1-6 switch tabs', async ({ page }) => {
    const tabs = ['everyone', 'end-users', 'platinum', 'gold', 'silver', 'academic'];
    for (let i = 0; i < tabs.length; i++) {
      await page.keyboard.press(String(i + 1));
      await page.waitForTimeout(200);
      const activeTab = page.locator(`.tab-button.active, .section-link.active`);
      await expect(activeTab).toHaveAttribute('data-tab', tabs[i]);
    }
  });

  test('shortcuts do not fire when typing in search input', async ({ page }) => {
    await page.locator('#search-input').focus();
    await page.keyboard.type('test');
    await expect(page.locator('#keyboard-help-modal')).not.toBeVisible();
  });

  test('"j" and "k" navigate between cards', async ({ page }) => {
    await page.keyboard.press('j');
    await page.keyboard.press('k');
    // Verify it doesn't crash
  });
});
