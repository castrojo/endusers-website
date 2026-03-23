# endusers-website — Operational Knowledge

## When to Use
Load this skill for any work in `castrojo/endusers-website` — Go backend, Astro frontend, data files, tests.

## When NOT to Use
For cross-site architecture, layout rules, keyboard shortcuts, or SiteSwitcher spec → also load `~/src/skills/cncf-dev/SKILL.md` and `~/src/skills/cncf-layout/SKILL.md`.

---

## What This Repo Is

CNCF End Users discovery site. Visualizes **~154 confirmed end-user organizations** (`isEndUser == true` in landscape data) from `landscape.cncf.io/data/full.json` with Crunchbase enrichment. No API tokens needed.

**Important:** The site shows 154 orgs, NOT all 721 CNCF members. The Go backend filters
to `CNCF Members` category AND `item.EndUser == true`. Do not revert this filter.

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
- `src/styles/` — variables.css, layout.css, cards.css

## Verified Feature Inventory (as of 2026-03-16)

| Feature | Status | Notes |
|---------|--------|-------|
| 5 tabs (everyone/platinum/gold/silver/academic) | ✅ Done | `src/lib/tabs.ts` |
| Industry filter + Country/region filter in sidebar | ✅ Done | `EndusersLayout.astro` |
| Member card: totalFunding, Joined date, Employee range | ✅ Done | `member-renderer.ts` |
| Confetti on member + hero cards | ✅ Done | `index.astro` wireCardEvents() |
| All keyboard shortcuts (/ s ? t 1-6 j k h Space Tab [ ] o Esc) | ✅ Done | `src/lib/keyboard.ts` |
| Rotating slogans + aria-live region | ✅ Done | `EndusersLayout.astro` |
| SiteSwitcher | ✅ Done | `SiteSwitcher.astro` |
| Stats box, Tier badge colors | ✅ Done | `EndusersLayout.astro`, `member-renderer.ts` |
| MiniSearch, RSS feed | ✅ Done | `src/lib/search.ts`, `src/pages/feed.xml.ts` |
| Changelog renderer (joined/left/tier_changed/updated events) | ✅ Done | `src/lib/changelog-renderer.ts` |
| Changelog wired into index.astro | ✅ Done | `src/pages/index.astro` |

## Known Bugs

- **Arch tab cards not visible at runtime** (2026-03-18): Clicking Reference Architectures tab shows blank grid. Cards render in built HTML (`arch-card` elements present in `dist/index.html`), fault is in JS tab-switch logic. Suspects: `showHeroesForTab()` display toggle or `applyFilters()` arch branch. Root cause not yet pinned. Add Playwright test in `tests/e2e/architecture.spec.ts`.

## Missing Features

- `summary/use_case` field not in SafeMember — full.json has it; not yet added to Go model

## Architectural Notes

- `src/styles/` has `variables.css`, `layout.css`, `cards.css` — all imported in `EndusersLayout.astro`
- The `<style is:global>` block covers only endusers-specific overrides
- Heroes use single-hero-per-tier pattern, NOT per-tab 8-card pools

## Tab Structure

| Tab | data-tab | Content |
|-----|----------|---------|
| Everyone | `everyone` | All ~154 end-user members |
| Platinum | `platinum` | Platinum tier within the 154 |
| Gold | `gold` | Gold tier within the 154 |
| Silver | `silver` | Silver tier within the 154 |
| Academic & Nonprofit | `academic` | Academic + Nonprofit within the 154 |

The "End Users" tab was removed — when backend only emits `isEndUser==true` members,
that tab is identical to "Everyone" and is redundant.

## Landscape MCP Server

Use `cncf-landscape` MCP for AI agent queries — do NOT fetch full.json manually.
- `query_members` — filter by tier, join dates
- `membership_metrics` — aggregate counts

## Testing Rules — TDD Required (Non-Negotiable)

**Tests MUST be written before implementation. Always.**

### Mandatory commit gate — ALL must pass before `git commit`

- `just test` passes (unit tests: `npx vitest run`)
- `just test-e2e` passes (E2E — requires `just serve` running, OR `npm run build && npx astro preview --port 4324`)
- Every new feature has at least one test verified **RED** before implementation

**If you cannot run the tests, the task is BLOCKED — not done.**

### TDD workflow

1. **Baseline**: Run `just test` — confirm all tests green
2. **Write tests first**: verify actual values — not class names or element existence
3. **Run `just test` → new tests MUST FAIL** (proves tests are real)
4. **Implement** the change
5. **Run `just test` → ALL tests must pass**

### What counts as a "richness test":

| ❌ BAD — structure only | ✅ GOOD — richness |
|---|---|
| `expect(html).toContain('tier-badge')` | `expect(html).toContain('#E5E4E2')` (actual Platinum color) |
| `expect(html).toContain('End User')` | `expect(html).toContain('data-enduser="true"')` |
| `expect(html).toContain('card-meta')` | `expect(html).toContain('href="https://example.com"')` |

### Cross-site tests (cross-site-header.spec.ts)

These require all 3 dev servers running. Use `CROSS_SITE_TEST=true npx playwright test` locally. Skip automatically in standard CI.

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

> **Status:** Not yet implemented. projects-website is the reference.

See `~/src/skills/cncf-layout/SKILL.md` → "Required Header Structure" for the full spec.

**Critical note:** endusers-website has ALL CSS inline in `src/layouts/EndusersLayout.astro`.

### What needs to change

- [ ] **Logo**: Change both logo width/height from 56 → 42
- [ ] **Remove slogan**: Delete `<p class="site-subtitle">` element, JS, and CSS
- [ ] **Move nav-group outside header-left**: must be direct child of `header-inner`
- [ ] **Add clear button**: `<button id="search-clear" class="search-clear" aria-label="Clear search">✕</button>`
- [ ] **Add clear button JS**: see cncf-layout skill

### CSS canonical values

```css
.cncf-logo-wrapper img { height: 42px; width: auto; }
.header-left           { flex-shrink: 0; }
.nav-group             { flex: 1; flex-direction: row; padding-left: 3rem; }
.search-input          { width: 360px; }
.search-count          { right: 2rem; }
```

### Tests to add after migration

Copy `tests/e2e/header.spec.ts` from `castrojo/projects-website` and update for endusers-website.
