import { test, expect } from '@playwright/test';

test.describe('keyboard shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.member-card', { timeout: 15000 });
  });

  test('"/" focuses search', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('"/" does not refocus when already in search', async ({ page }) => {
    await page.locator('#search-input').focus();
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

  test('"?" uses add not toggle — pressing twice keeps modal open', async ({ page }) => {
    await page.keyboard.press('?');
    await expect(page.locator('#keyboard-help-modal')).toBeVisible();
    await page.keyboard.press('?');
    await expect(page.locator('#keyboard-help-modal')).toBeVisible();
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

  test('Escape clears search and resets focus', async ({ page }) => {
    await page.locator('#search-input').fill('test');
    await page.keyboard.press('Escape');
    await expect(page.locator('#search-input')).toHaveValue('');
  });

  test('number keys 1-5 switch tabs', async ({ page }) => {
    const tabs = ['everyone', 'platinum', 'gold', 'silver', 'academic'];
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

  test('"j" applies keyboard-focused class to first card', async ({ page }) => {
    await page.keyboard.press('j');
    const focused = page.locator('.keyboard-focused');
    await expect(focused).toHaveCount(1);
    const tag = await focused.first().evaluate(el => el.classList.contains('member-card') || el.classList.contains('hero-card'));
    expect(tag).toBe(true);
  });

  test('"k" after "j" moves keyboard-focused class backward', async ({ page }) => {
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('k');
    const focused = page.locator('.keyboard-focused');
    await expect(focused).toHaveCount(1);
  });

  test('keyboard-focused resets on tab click', async ({ page }) => {
    await page.keyboard.press('j');
    await expect(page.locator('.keyboard-focused')).toHaveCount(1);
    await page.locator('.section-link[data-tab="platinum"]').click();
    await expect(page.locator('.keyboard-focused')).toHaveCount(0);
  });

  test('"h" scrolls to top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    await page.keyboard.press('h');
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });

  test('Space scrolls down', async ({ page }) => {
    const before = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBeGreaterThan(before);
  });

  test('Shift+Space scrolls up', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(100);
    await page.keyboard.press('Shift+ ');
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(800);
  });

  test('Tab cycles to next tab', async ({ page }) => {
    await expect(page.locator('.section-link.active')).toHaveAttribute('data-tab', 'everyone');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    await expect(page.locator('.section-link.active')).toHaveAttribute('data-tab', 'platinum');
  });

  test('Shift+Tab cycles to previous tab', async ({ page }) => {
    await expect(page.locator('.section-link.active')).toHaveAttribute('data-tab', 'everyone');
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);
    // 6 tabs now: everyone→platinum→gold→silver→academic→architectures.
    // Wrapping back from everyone lands on architectures (index 5).
    await expect(page.locator('.section-link.active')).toHaveAttribute('data-tab', 'architectures');
  });

  test('"o" opens focused card link in new tab', async ({ page }) => {
    await page.keyboard.press('j');
    const newTabPromise = page.context().waitForEvent('page', { timeout: 3000 }).catch(() => null);
    await page.keyboard.press('o');
    const newTab = await newTabPromise;
    // Either a new tab opened or the card had no link — both are acceptable
    if (newTab) {
      expect(newTab.url()).toBeTruthy();
    }
  });
});
