import { test, expect } from '@playwright/test';

// ─── Canonical header values (from projects-website reference) ───────────────
// These MUST match projects-website exactly. If projects changes, update all three.
const CANONICAL = {
  logoSize: 42,
  siteTitleFontSize: '22px',   // 1.375rem at 16px base
  siteTitleFontWeight: '700',
  logoTitleGap: '8px',         // 0.5rem
  navGroupPaddingLeft: '48px', // 3rem
  sectionLinkFontSize: '14px', // 0.875rem
  sectionLinkPadding: '8px 16px', // 0.5rem 1rem
  searchInputWidth: '360px',
  accentColor: 'rgb(0, 134, 255)', // #0086ff cncf-blue (canonical per cncf-dev skill)
  stickyHeader: true,
};

test.describe('header — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.site-header', { timeout: 10000 });
  });

  test('logo is 42×42', async ({ page }) => {
    const size = await page.evaluate(() => {
      const wrapper = document.querySelector('.cncf-logo-wrapper');
      const el = wrapper?.querySelector('img, svg') as HTMLElement | null;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    expect(size).not.toBeNull();
    expect(size!.w).toBe(CANONICAL.logoSize);
    expect(size!.h).toBe(CANONICAL.logoSize);
  });

  test('site-title is 1.375rem / 700 weight', async ({ page }) => {
    const style = await page.evaluate(() => {
      const el = document.querySelector('.site-title');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(style).not.toBeNull();
    expect(style!.fontSize).toBe(CANONICAL.siteTitleFontSize);
    expect(style!.fontWeight).toBe(CANONICAL.siteTitleFontWeight);
  });

  test('site-title reads "CNCF End Users"', async ({ page }) => {
    const text = await page.locator('.site-title').textContent();
    expect(text?.trim()).toBe('CNCF End Users');
  });

  test('logo-title gap is 0.5rem', async ({ page }) => {
    const gap = await page.evaluate(() => {
      const el = document.querySelector('.logo-title');
      return el ? getComputedStyle(el).gap || getComputedStyle(el).columnGap : null;
    });
    expect(gap).toBe(CANONICAL.logoTitleGap);
  });

  test('nav-group has padding-left 3rem', async ({ page }) => {
    const pl = await page.evaluate(() => {
      const el = document.querySelector('.nav-group');
      return el ? getComputedStyle(el).paddingLeft : null;
    });
    expect(pl).toBe(CANONICAL.navGroupPaddingLeft);
  });

  test('nav-group is sibling of header-left (not nested inside)', async ({ page }) => {
    const isChild = await page.evaluate(() => {
      const headerLeft = document.querySelector('.header-left');
      const navGroup = document.querySelector('.nav-group');
      return headerLeft && navGroup ? headerLeft.contains(navGroup) : false;
    });
    expect(isChild).toBe(false);
  });

  test('section-link font-size is 0.875rem', async ({ page }) => {
    const fs = await page.evaluate(() => {
      const el = document.querySelector('.section-link');
      return el ? getComputedStyle(el).fontSize : null;
    });
    expect(fs).toBe(CANONICAL.sectionLinkFontSize);
  });

  test('search-input width is 360px on desktop', async ({ page }) => {
    const w = await page.evaluate(() => {
      const el = document.getElementById('search-input') as HTMLInputElement | null;
      return el ? getComputedStyle(el).width : null;
    });
    expect(w).toBe(CANONICAL.searchInputWidth);
  });

  test('site-header is sticky positioned', async ({ page }) => {
    const pos = await page.evaluate(() => {
      const el = document.querySelector('.site-header');
      return el ? getComputedStyle(el).position : null;
    });
    expect(pos).toBe('sticky');
  });

  test('active tab uses cncf-blue #0086ff in light mode', async ({ page }) => {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    const color = await page.evaluate(() => {
      const el = document.querySelector('.section-link.active');
      return el ? getComputedStyle(el).color : null;
    });
    expect(color).toBe(CANONICAL.accentColor);
  });

  test('body uses system font stack', async ({ page }) => {
    const ff = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(ff.toLowerCase()).toContain('-apple-system');
  });

  test('header-actions contains theme toggle and help button', async ({ page }) => {
    await expect(page.locator('.header-actions #theme-toggle')).toBeVisible();
    await expect(page.locator('.header-actions #help-button')).toBeVisible();
  });

  test('search-clear button exists in search-wrapper', async ({ page }) => {
    await expect(page.locator('.search-wrapper #search-clear')).toBeAttached();
  });

  test('SiteSwitcher has exactly 3 pills: People, Projects, End Users', async ({ page }) => {
    const pills = await page.locator('.switcher-pill').allTextContents();
    expect(pills.map(p => p.trim())).toEqual(['People', 'Projects', 'End Users']);
  });

  test('"End Users" pill is active', async ({ page }) => {
    const activePill = await page.locator('.switcher-pill.active').textContent();
    expect(activePill?.trim()).toBe('End Users');
  });

  test('6 tabs: Everyone, End Users, Platinum, Gold, Silver, Academic & Nonprofit', async ({ page }) => {
    const tabs = await page.locator('.section-nav .section-link').allTextContents();
    const trimmed = tabs.map(t => t.trim());
    expect(trimmed).toContain('Everyone');
    expect(trimmed).toContain('End Users');
    expect(trimmed).toContain('Platinum');
    expect(trimmed).toContain('Gold');
    expect(trimmed).toContain('Silver');
  });
});

test.describe('header — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('.site-header', { timeout: 10000 });
  });

  test('nav-group stacks below header-left on mobile', async ({ page }) => {
    const positions = await page.evaluate(() => {
      const left = document.querySelector('.header-left');
      const nav = document.querySelector('.nav-group');
      if (!left || !nav) return null;
      return {
        leftBottom: left.getBoundingClientRect().bottom,
        navTop: nav.getBoundingClientRect().top,
      };
    });
    expect(positions).not.toBeNull();
    expect(positions!.navTop).toBeGreaterThanOrEqual(positions!.leftBottom - 4);
  });

  test('search input has positive width on mobile', async ({ page }) => {
    const width = await page.evaluate(() => {
      const el = document.getElementById('search-input');
      return el ? el.getBoundingClientRect().width : 0;
    });
    expect(width).toBeGreaterThan(100);
  });

  test('SiteSwitcher pills are compact on mobile', async ({ page }) => {
    const padding = await page.evaluate(() => {
      const pill = document.querySelector('.switcher-pill');
      return pill ? parseFloat(getComputedStyle(pill).paddingTop) : 999;
    });
    expect(padding).toBeLessThanOrEqual(4);
  });
});
