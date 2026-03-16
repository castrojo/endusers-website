import { test, expect } from '@playwright/test';

test.describe('layout structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
  });

  test('sidebar is on the LEFT side of content', async ({ page }) => {
    const sidebar = page.locator('aside.sidebar');
    const content = page.locator('.main-content');
    await expect(sidebar).toBeVisible();
    await expect(content).toBeVisible();
    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();
    expect(sidebarBox!.x).toBeLessThan(contentBox!.x);
  });

  test('CNCF logo is visible in header', async ({ page }) => {
    // Must have a CNCF logo in the header (SVG component or img)
    const logo = page.locator('header .cncf-logo-wrapper, header .site-logo, header img[alt*="CNCF"], header svg');
    await expect(logo.first()).toBeVisible();
  });

  test('header has proper structure with h1 title', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.locator('h1')).toBeVisible();
    await expect(header.locator('.site-switcher')).toBeVisible();
    await expect(header.locator('#search-input')).toBeVisible();
    await expect(header.locator('#help-button')).toBeVisible();
  });

  test('search input is in .nav-group (sibling of header-left, not inside it)', async ({ page }) => {
    const searchInNavGroup = page.locator('.nav-group #search-input');
    await expect(searchInNavGroup).toBeVisible();
    const searchInLeft = page.locator('.header-left #search-input');
    await expect(searchInLeft).toHaveCount(0);
  });

  test('tab navigation with tier buttons is inside the header container', async ({ page }) => {
    // The actual tier tab buttons (Everyone, Platinum, etc.) should be inside header,
    // not just any <nav> (SiteSwitcher is also a nav but is different)
    const tabsInHeader = page.locator('header .tabs-bar, header .section-nav, header [data-tab="everyone"]');
    await expect(tabsInHeader.first()).toBeVisible();
  });

  test('sidebar has stats box as first item', async ({ page }) => {
    const statsBox = page.locator('aside.sidebar .stats-box');
    await expect(statsBox).toBeVisible();
  });

  test('search count span exists', async ({ page }) => {
    const searchCount = page.locator('#search-count');
    await expect(searchCount).toBeAttached();
  });

  test('kbd-live-region div exists for accessibility', async ({ page }) => {
    const liveRegion = page.locator('#kbd-live-region');
    await expect(liveRegion).toBeAttached();
  });

  test('SiteSwitcher has 3 pills with correct labels', async ({ page }) => {
    const pills = page.locator('.switcher-pill');
    await expect(pills).toHaveCount(3);
    await expect(pills.nth(0)).toContainText(/People/i);
    await expect(pills.nth(1)).toContainText(/Projects/i);
    await expect(pills.nth(2)).toContainText(/End Users/i);
  });

  test('industry filter dropdown exists in sidebar', async ({ page }) => {
    const filter = page.locator('#industry-filter, #category-filter');
    await expect(filter).toBeVisible();
  });

  test('country/region filter dropdown exists in sidebar', async ({ page }) => {
    const filter = page.locator('#country-filter, #region-filter');
    await expect(filter).toBeVisible();
  });
});
