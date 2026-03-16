# endusers-website — Agent Guide

**First action**: Load the shared skill, then check the gap checklist.

```
/skills cncf-dev
```

## What This Repo Is

CNCF End Users discovery site — third pillar of the Indie Cloud Native trilogy.
Visualizes 721 CNCF member organizations from `landscape.cncf.io/data/full.json`
with Crunchbase enrichment (703/721 have company data). No API tokens needed.

- **Repo**: `castrojo/endusers-website` (branch: `main`)
- **Live**: `https://castrojo.github.io/endusers-website/`
- **Container**: `ghcr.io/castrojo/endusers-website`

## Quick Start

```bash
just serve        # build container → run on :8082 → open browser
just sync-dev     # Go sync + Astro hot-reload (fast UI iteration)
just build        # full production build to dist/
just sync         # Go backend only (regenerate members.json)
just test         # npx vitest run
just test-e2e     # npx playwright test
```

## Architecture

```
Go backend (endusers-go/) → members.json + changelog.json
Astro SSG → static shell + copies JSON to public/data/
Browser → fetch members.json → single renderCard() renders all cards
```

Key files:
- `endusers-go/internal/fetcher/landscape.go` — fetches full.json, filters CNCF Members
- `src/lib/member-renderer.ts` — THE single renderCard() function
- `src/lib/heroes.ts` — djb2 hero rotation, selectHeroSets()
- `src/pages/index.astro` — thin shell + hero grid + staff row + card container
- `src/data/staff-support.json` — committed (not gitignored)
- `src/styles/` — variables.css (cards.css missing — gap)

## Verified Feature Inventory (as of 2026-03-16)

All features verified against source code.

| Feature | Status | Notes |
|---------|--------|-------|
| 6 tabs (everyone/end-users/platinum/gold/silver/academic) | ✅ Done | `src/lib/tabs.ts` |
| Industry filter in sidebar | ✅ Done | `EndusersLayout.astro`, JS filter in `index.astro` |
| Country/region filter in sidebar | ✅ Done | dropdown by country name |
| Member card: totalFunding display | ✅ Done | `member-renderer.ts` formatFunding() |
| Member card: Joined date | ✅ Done | `member-renderer.ts` |
| Member card: Employee range | ✅ Done | `member-renderer.ts` formatEmployees() |
| Confetti on member cards (fireFountain) | ✅ Done | `index.astro` wireCardEvents() |
| Confetti on hero cards (fireHearts) | ✅ Done | `index.astro` wireCardEvents() |
| All keyboard shortcuts (/ s ? t 1-6 j k h Space Tab [ ] o Esc) | ✅ Done | `src/lib/keyboard.ts` |
| Rotating slogans | ✅ Done | `EndusersLayout.astro` |
| `kbd-live-region` aria-live region | ✅ Done | `EndusersLayout.astro` |
| SiteSwitcher | ✅ Done | `SiteSwitcher.astro` |
| Site nav order: `[`=Projects, `]`=People | ✅ Done | `index.astro` lines 199-200 |
| Stats box (total members, end users, showing count, total funding) | ✅ Done | `EndusersLayout.astro` |
| Tier badge colors (Gold, Silver, End User, Academic, Nonprofit) | ✅ Done | `member-renderer.ts` |
| MiniSearch search | ✅ Done | `src/lib/search.ts` |
| RSS feed | ✅ Done | `src/pages/feed.xml.ts` |

## Confirmed Bugs — Fix These

- [ ] **Platinum color wrong** — `member-renderer.ts` line 12: `Platinum: '#B0B0B0'` must be `'#E5E4E2'` (spec). One-line fix.

## Missing Features — Implement These

- [ ] **Hero grid is 4 heroes total, not 2×4 per tab** — Current: `selectHeroes()` returns one hero per tier (endUser/platinum/recentlyJoined/community) = 4 total. Spec: 8 heroes per tab, tab-scoped (everyone/end-users/platinum/gold/silver/academic). Must rewrite `src/lib/heroes.ts` to use `heroSlots()` pattern from projects-website, add `selectHeroSets()`, and update `index.astro` to render tab-scoped grids with `data-heroes-tab` attribute. Also need `showHeroesForTab()` logic.

- [ ] **Staff support section missing entirely** — No `src/data/staff-support.json`, no section in `index.astro`. Add: create JSON file (copy structure from projects-website `maintainers` key), add `<section class="staff-support-section">` to `index.astro` after hero grid, add CSS. Must be committed (add `!src/data/staff-support.json` to .gitignore exception).

- [ ] **No cards.css / layout.css** — All styles are inlined in `EndusersLayout.astro` as `<style is:global>`. Extract to `src/styles/cards.css` and `src/styles/layout.css`, import via `@import` in the layout. Matches projects-website architecture.

## Architectural Notes

- `src/styles/` only has `variables.css` — layout and card CSS are inline in `EndusersLayout.astro`
- No `src/data/staff-support.json` (must be added and committed, not gitignored)
- Heroes use single-hero-per-tier pattern, NOT per-tab 8-card pools

## Tab Structure

| Tab | Content |
|-----|---------|
| Everyone | All 721 CNCF members |
| End Users | isEndUser=true (~154 orgs) |
| Platinum | Platinum tier (~14) |
| Gold | Gold tier (~17) |
| Silver | Silver tier (~583) |
| Academic & Nonprofit | Academic (3) + Nonprofit (21) |

## Skills

- Load `/skills cncf-dev` for full architecture spec, gap checklists, card designs, CSS rules
- Landscape data queries: use `cncf-landscape` MCP server (`query_members`, `membership_metrics`)

## Landscape MCP Server

When you need to look up CNCF member data as an AI agent, use the MCP server:
- `query_members` — filter by tier, join dates
- `membership_metrics` — aggregate counts
- DO NOT fetch `https://landscape.cncf.io/data/full.json` manually

The Go backend fetches full.json directly (richer fields than MCP). The MCP server
is for AI agent queries only.

## Testing Rules — TDD Required (Non-Negotiable)

**Tests MUST be written before implementation. Always.**

### Mandatory commit gate — ALL must pass before `git commit`

- `just test` passes (unit tests: `npx vitest run`)
- `just test-e2e` passes (E2E — requires `just serve` running, OR `npm run build && npx astro preview --port 4324` in another terminal)
- Every new feature has at least one test verified **RED** before implementation

**If you cannot run the tests, the task is BLOCKED — not done. Do not commit. Do not mark ✅.**

### TDD workflow for any renderer or component change:

1. **Baseline**: Run `just test` — confirm all tests green before touching anything
2. **Write tests first**: For EVERY field the component renders, write a test that verifies the actual value — not just class names or element existence
3. **Run `just test` → new tests MUST FAIL** (red is correct; proves tests are real)
4. **Implement** the change
5. **Run `just test` → ALL tests must pass** (green)

### What counts as a "richness test" (required for every renderer):

| ❌ BAD — structure only | ✅ GOOD — richness |
|---|---|
| `expect(html).toContain('tier-badge')` | `expect(html).toContain('#E5E4E2')` (actual Platinum color) |
| `expect(html).toContain('End User')` | `expect(html).toContain('data-enduser="true"')` |
| `expect(html).toContain('card-meta')` | `expect(html).toContain('href="https://example.com"')` |

### Astro-specific rule

**Logic in `.astro` files is NOT unit-testable.** Always extract business logic to `src/lib/*.ts` modules. Test those modules with Vitest. Never put tab filtering, search logic, or card rendering logic directly in `.astro` files.

### Cross-site tests (cross-site-header.spec.ts)

These require all 3 dev servers running. Use `CROSS_SITE_TEST=true npx playwright test` locally. Do NOT expect them to pass in standard CI — they skip automatically via beforeEach guard.

## Branch + Commit

```bash
git add . && git commit -m "feat: description

Assisted-by: Claude Sonnet 4.6 via GitHub Copilot
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

Branch is `main`. Push directly (castrojo-owned, no fork workflow).

---

## Header Migration (PENDING — canonical design from projects-website)

> **Status:** Not yet implemented. projects-website is the reference. Implement this section exactly.

The canonical header was finalized on 2026-03-16 in `castrojo/projects-website`.
All three sites must be pixel-perfect identical in header structure.
See `~/src/skills/cncf-layout/SKILL.md` → "Required Header Structure" for the full spec.

### What needs to change in endusers-website

**Critical note:** endusers-website has ALL CSS inline in `src/layouts/EndusersLayout.astro`
in one giant `<style>` block. Until CSS is extracted to `src/styles/layout.css`,
make all changes to that inline block.

#### HTML (`src/layouts/EndusersLayout.astro`)

- [ ] **Logo**: Change both logo `width`/`height` attributes from `56` → `42`
- [ ] **Remove slogan**: Delete `<p class="site-subtitle" id="rotating-slogan">` element
- [ ] **Remove slogan JS**: Delete the `SLOGANS` array + `setInterval` block  
- [ ] **Remove slogan CSS**: Delete `.site-subtitle` and `.site-subtitle.fade` rules
- [ ] **Move nav-group outside header-left**: `nav-group` div must be a direct child of `header-inner`, NOT nested inside `header-left`
- [ ] **Add clear button**: Add `<button id="search-clear" class="search-clear" aria-label="Clear search">✕</button>` inside `.search-wrapper`
- [ ] **Add clear button JS**: Add the clear button event handler (see skill for exact code)

#### CSS (inline `<style>` block in EndusersLayout.astro)

```css
/* Replace old values with these canonical values */
.logo-title            { gap: 0.5rem; }
.cncf-logo-wrapper img { height: 42px; width: auto; object-fit: contain; display: block; }
.title-block           { height: 42px; display: flex; align-items: center; }
.site-title            { font-size: 1.375rem; font-weight: 700; }
.header-left           { flex-shrink: 0; }    /* REMOVE flex:1 */
.nav-group             { flex: 1; flex-direction: row; align-items: center;
                         justify-content: flex-start; gap: 0.75rem; padding-left: 3rem; }
                         /* REMOVE: flex-direction: column, max-width: 600px */
.search-input          { width: 360px; padding: 0.5rem 2rem 0.5rem 0.75rem; }
                         /* was: width: 220px */
.search-input:focus    { border-color: var(--color-cncf-blue);
                         box-shadow: 0 0 0 2px var(--color-cncf-blue); }
                         /* was: box-shadow with rgba (fuzzy glow) */
.search-count          { right: 2rem; }   /* was: right: 0.5rem */
.search-clear          { /* new — see cncf-layout skill for full rule */ }

/* REMOVE mobile override: #search-input { width: 160px } */

/* Mobile breakpoint — add this block */
@media (max-width: 768px) {
  .header-inner  { flex-wrap: wrap; gap: 0.75rem; }
  .nav-group     { order: 3; flex: 1 1 100%; justify-content: flex-start; padding-left: 0; }
  .header-actions { order: 2; margin-left: auto; }
  .header-left   { order: 1; }
  .search-input  { width: 100%; }
  .nav-group .search-wrapper { flex: 1; }
  .nav-group .site-switcher  { padding: 1px; }
  .nav-group .switcher-pill  { padding: 0.2rem 0.55rem; font-size: 0.75rem; }
}
```

#### CSS variables

endusers-website CSS variables may be inline or missing. Ensure these exist:
```css
--color-accent-emphasis: #0969da;   /* light */
--color-text-tertiary: #6e7781;     /* light */
/* dark theme: */
--color-accent-emphasis: #2f81f7;
--color-text-tertiary: #8b949e;
```

### Future CSS extraction (separate task)

After the header migration, extract the inline style block to:
- `src/styles/variables.css`
- `src/styles/layout.css`
- `src/styles/cards.css`
Mirroring the projects-website structure exactly.

### Tests to add after migration

Copy `tests/e2e/header.spec.ts` from `castrojo/projects-website` and update:
- `"CNCF Projects"` → `"CNCF End Users"` (or site title)
- `activeSite="projects"` → `activeSite="endusers"`
- Section-nav tab count/labels to match endusers tabs
- Base URL in playwright.config.ts
