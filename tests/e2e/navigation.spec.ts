import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/endusers-website/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page loads with member cards', async ({ page }) => {
    const cards = page.locator('.member-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('6 tabs exist: Everyone, End Users, Platinum, Gold, Silver, Academic & Nonprofit', async ({ page }) => {
    for (const tab of ['everyone', 'end-users', 'platinum', 'gold', 'silver', 'academic']) {
      await expect(page.locator(`[data-tab="${tab}"]`)).toBeVisible();
    }
  });

  test('clicking a tab filters cards', async ({ page }) => {
    await page.click('[data-tab="platinum"]');
    await page.waitForTimeout(500);
    const cards = page.locator('.member-card:visible');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('hero section shows 4 spotlight cards', async ({ page }) => {
    const heroes = page.locator('.hero-card, .heroes-section .hero-card');
    await expect(heroes.first()).toBeVisible({ timeout: 5000 });
    const count = await heroes.count();
    expect(count).toBe(4);
  });

  test('stats box shows member counts', async ({ page }) => {
    const statsBox = page.locator('.stats-box');
    await expect(statsBox).toBeVisible();
    const text = await statsBox.textContent();
    // Should have numeric counts
    expect(text).toMatch(/\d+/);
  });

  test('cards contain expected content: badge, name, description', async ({ page }) => {
    const firstCard = page.locator('.member-card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('[class*="badge"], [class*="tier"]').first()).toBeVisible();
    await expect(firstCard.locator('.card-name, .member-name, h3, h4')).toBeVisible();
  });

  test('RSS feed link exists', async ({ page }) => {
    const rssLink = page.locator('a[href*="feed.xml"]');
    await expect(rssLink).toBeAttached();
  });
});
