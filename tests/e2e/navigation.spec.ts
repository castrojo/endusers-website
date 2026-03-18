import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  test('page loads with member cards', async ({ page }) => {
    const cards = page.locator('.member-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('5 tabs exist: Everyone, Platinum, Gold, Silver, Academic & Nonprofit', async ({ page }) => {
    for (const tab of ['everyone', 'platinum', 'gold', 'silver', 'academic']) {
      await expect(page.locator(`[data-tab="${tab}"]`)).toBeVisible();
    }
    // end-users tab must not exist (removed — backend now only emits isEndUser==true members)
    await expect(page.locator('[data-tab="end-users"]')).toHaveCount(0);
  });

  test('clicking a tab filters cards', async ({ page }) => {
    await page.click('[data-tab="platinum"]');
    await page.waitForTimeout(500);
    const cards = page.locator('.member-card:visible');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('hero section shows 6 spotlight cards on everyone tab', async ({ page }) => {
    // selectHeroSets everyone = 2 platinum + 2 gold + 2 silver = 6
    const visibleGrid = page.locator('.heroes-grid[data-heroes-tab="everyone"]');
    await expect(visibleGrid).toBeVisible({ timeout: 5000 });
    const count = await visibleGrid.locator('.hero-card').count();
    expect(count).toBe(6);
  });

  test('stats box shows member counts', async ({ page }) => {
    // Target the member stats box specifically — arch-stats-box is a sibling inside arch-sidebar-sections.
    const statsBox = page.locator('#member-sidebar-sections .stats-box');
    await expect(statsBox).toBeVisible();
    const text = await statsBox.textContent();
    // Should have numeric counts
    expect(text).toMatch(/\d+/);
  });

  test('cards contain expected content: badge, name, description', async ({ page }) => {
    // Scope to #members-grid — changelog event cards also use .member-card but have no tier-badge.
    const firstCard = page.locator('#members-grid .member-card').first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('.tier-badge').first()).toBeVisible({ timeout: 10000 });
    await expect(firstCard.locator('.card-name, .member-name, h3, h4')).toBeVisible();
  });

  test('RSS feed link exists', async ({ page }) => {
    const rssLink = page.locator('a[href*="feed.xml"]');
    await expect(rssLink).toBeAttached();
  });
});
