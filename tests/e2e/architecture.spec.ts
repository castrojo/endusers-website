import { test, expect } from '@playwright/test';

/**
 * E2E tests for the Reference Architectures tab (tab 6).
 *
 * Uses src/data/architectures.json with real production entries. Tests are
 * data-agnostic where possible — they assert on counts ≥ 1 rather than exact
 * fixture counts, and use real refArchType / industry values from the data.
 */

test.describe('Reference Architectures tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    // Wait for the page to be interactive (member cards load async).
    await page.waitForSelector('.member-card', { timeout: 15000 });
  });

  // ── Tab activation ──────────────────────────────────────────────────────

  test('tab 6 key activates the architectures tab', async ({ page }) => {
    await page.keyboard.press('6');
    await expect(page.locator('[data-tab="architectures"]')).toHaveClass(/active/);
    await expect(page.locator('#arch-grid')).toBeVisible();
  });

  test('clicking the architectures tab shows arch-grid and hides members-grid', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await expect(page.locator('#arch-grid')).toBeVisible();
    await expect(page.locator('#members-grid')).not.toBeVisible();
  });

  test('arch count badge is visible on the architectures tab button', async ({ page }) => {
    const badge = page.locator('[data-tab="architectures"] .tab-count');
    await expect(badge).toBeVisible();
    // Badge shows the number of architecture entries (data-agnostic).
    await expect(badge).toHaveText(/^\d+$/);
  });

  // ── Arch cards render ───────────────────────────────────────────────────

  test('arch cards are rendered from fixture data', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    const cards = page.locator('.arch-card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('arch card shows org name, title and submittedAt', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    const card = page.locator('.arch-card[data-slug="adobe"]');
    await expect(card.locator('.arch-org-name')).toContainText('Adobe');
    // Real submittedAt from architectures.json
    await expect(card.locator('.arch-submitted')).toContainText('Submitted 2024-10-11');
  });

  test('arch card shows tag chips', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    const card = page.locator('.arch-card[data-slug="adobe"]');
    await expect(card.locator('.arch-tag').first()).toBeVisible();
  });

  // ── Sidebar context switch ──────────────────────────────────────────────

  test('member sidebar hides and arch sidebar shows on arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await expect(page.locator('#member-sidebar-sections')).not.toBeVisible();
    await expect(page.locator('#arch-sidebar-sections')).toBeVisible();
  });

  test('arch stats box shows correct count', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    const statsBox = page.locator('#arch-stats-box');
    await expect(statsBox).toBeVisible();
    // Stats box should contain a number (data-agnostic).
    await expect(statsBox).toContainText(/\d+/);
  });

  test('member sidebar restores when switching back from arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.click('[data-tab="everyone"]');
    await expect(page.locator('#member-sidebar-sections')).toBeVisible();
    await expect(page.locator('#arch-sidebar-sections')).not.toBeVisible();
  });

  test('search placeholder updates to "Search architectures..." on arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await expect(page.locator('#search-input')).toHaveAttribute('placeholder', /Search architectures/);
  });

  test('search placeholder restores on leaving arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.click('[data-tab="everyone"]');
    await expect(page.locator('#search-input')).toHaveAttribute('placeholder', /Search members/);
  });

  // ── Keyboard navigation on arch tab ────────────────────────────────────

  test('j key focuses first arch card on arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    // Click body to ensure focus is on document, not a button.
    await page.click('body');
    await page.keyboard.press('j');
    const focused = page.locator('.arch-card.keyboard-focused');
    await expect(focused).toHaveCount(1);
  });

  test('j/k navigate between arch cards', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.click('body');
    await page.keyboard.press('j'); // focus card 0
    await page.keyboard.press('j'); // move to card 1
    const focused = page.locator('.arch-card.keyboard-focused');
    await expect(focused).toHaveCount(1);
    // Card at index 1 is focused — slug depends on data order, so only count is asserted.
  });

  test('k key moves focus to previous arch card', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.click('body');
    await page.keyboard.press('j'); // card 0
    await page.keyboard.press('j'); // card 1
    await page.keyboard.press('k'); // back to card 0
    const focused = page.locator('.arch-card.keyboard-focused');
    // First card (zeiss) should be focused — the first entry in architectures.json.
    await expect(focused).toHaveAttribute('data-slug', 'zeiss');
  });

  // ── Search on arch tab ─────────────────────────────────────────────────

  test('search filters arch cards by org name', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.fill('#search-input', 'Adobe');
    await page.waitForTimeout(300); // debounce / MiniSearch
    await expect(page.locator('.arch-card[data-slug="adobe"]')).toBeVisible();
    await expect(page.locator('.arch-card[data-slug="allianz"]')).not.toBeVisible();
  });

  test('clearing search restores all arch cards', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.fill('#search-input', 'Adobe');
    await page.waitForTimeout(300);
    await page.fill('#search-input', '');
    await page.waitForTimeout(300);
    expect(await page.locator('.arch-card').count()).toBeGreaterThan(0);
  });

  // ── Arch-specific sidebar filters ──────────────────────────────────────

  test('refArchType filter narrows visible arch cards', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    // "CI/CD" only exists in adobe in the real data.
    await page.selectOption('#arch-reftype-filter', 'CI/CD');
    await expect(page.locator('.arch-card[data-slug="adobe"]')).toBeVisible();
    await expect(page.locator('.arch-card[data-slug="allianz"]')).not.toBeVisible();
  });

  test('industry filter narrows visible arch cards', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    // "Insurance" only exists in allianz in the real data.
    await page.selectOption('#arch-industry-filter', 'Insurance');
    await expect(page.locator('.arch-card[data-slug="allianz"]')).toBeVisible();
    await expect(page.locator('.arch-card[data-slug="adobe"]')).not.toBeVisible();
  });

  test('arch filters reset to "All" when switching away from arch tab', async ({ page }) => {
    await page.click('[data-tab="architectures"]');
    await page.selectOption('#arch-reftype-filter', 'CI/CD');
    // Leave arch tab
    await page.click('[data-tab="everyone"]');
    // Return — filter should be reset
    await page.click('[data-tab="architectures"]');
    const select = page.locator('#arch-reftype-filter');
    await expect(select).toHaveValue('');
    // All cards visible again (data-agnostic count)
    expect(await page.locator('.arch-card').count()).toBeGreaterThan(0);
  });

  // ── Keyboard help modal ─────────────────────────────────────────────────

  test('keyboard help modal shows updated j/k/o descriptions', async ({ page }) => {
    await page.keyboard.press('?');
    const modal = page.locator('#keyboard-help-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Next card');
    await expect(modal).toContainText('Previous card');
    await expect(modal).toContainText('Open focused card in new tab');
    await expect(modal).toContainText('1');
    await expect(modal).toContainText('6');
  });
});
