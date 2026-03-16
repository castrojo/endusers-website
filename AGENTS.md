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

## Testing Rules

- Run `npx playwright test` before and after any change
- Visual layout tests in `tests/e2e/visual-layout.spec.ts` check computed CSS
- Element-existence tests alone are insufficient
- Run E2E tests sequentially when running all 3 sites (port conflicts)

## Branch + Commit

```bash
git add . && git commit -m "feat: description

Assisted-by: Claude Sonnet 4.6 via GitHub Copilot
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

Branch is `main`. Push directly (castrojo-owned, no fork workflow).
