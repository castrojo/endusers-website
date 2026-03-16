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

## Gap Checklist

Items not yet verified or implemented vs original design:

- [ ] 2 rows of 4 hero cards per tab (verify full 2×4 grid is implemented)
- [ ] Industry filter in sidebar (from crunchbase categories)
- [ ] Country/region filter in sidebar (may be missing entirely)
- [ ] Tier badge colors: Platinum=#E5E4E2, Gold=#FFB300, Silver=#C0C0C0, EndUser=#0086FF, Academic=#7B2FBE, Nonprofit=#00A86B
- [ ] Member card: totalFunding display (formatted USD)
- [ ] Member card: Joined date displayed
- [ ] Member card: Employee range displayed
- [ ] cards.css — missing from src/styles/ (currently no card styles file)

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
