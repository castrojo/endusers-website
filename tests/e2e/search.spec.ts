import { test, expect } from '@playwright/test';

test.describe('search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/endusers-website/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.member-card', { timeout: 10000 });
  });

  test('search input exists and is focusable', async ({ page }) => {
    const input = page.locator('#search-input');
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('typing a query filters cards', async ({ page }) => {
    const cardsBefore = await page.locator('.member-card').count();
    await page.fill('#search-input', 'google');
    await page.waitForTimeout(500);
    const cardsAfter = await page.locator('.member-card:visible').count();
    expect(cardsAfter).toBeLessThan(cardsBefore);
    expect(cardsAfter).toBeGreaterThan(0);
  });

  test('search result count updates', async ({ page }) => {
    await page.fill('#search-input', 'apple');
    await page.waitForTimeout(500);
    const countEl = page.locator('#search-count');
    const text = await countEl.textContent();
    expect(text).not.toBe('');
  });

  test('clearing search restores all cards', async ({ page }) => {
    const originalCount = await page.locator('.member-card').count();
    await page.fill('#search-input', 'google');
    await page.waitForTimeout(300);
    await page.fill('#search-input', '');
    await page.waitForTimeout(300);
    const restoredCount = await page.locator('.member-card').count();
    expect(restoredCount).toBe(originalCount);
  });

  test('pressing "/" focuses search input', async ({ page }) => {
    await page.keyboard.press('/');
    await expect(page.locator('#search-input')).toBeFocused();
  });

  test('no results for nonsense query', async ({ page }) => {
    await page.fill('#search-input', 'xyznonexistentmember123');
    await page.waitForTimeout(500);
    const visibleCards = await page.locator('.member-card:visible').count();
    expect(visibleCards).toBe(0);
  });
});
