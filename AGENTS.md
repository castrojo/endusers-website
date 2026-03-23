> ⛔ Never open upstream PRs. Full rules: `cat ~/src/skills/workflow/SKILL.md`

# castrojo/endusers-website

CNCF End Users discovery site — third pillar of the Indie Cloud Native trilogy.
Live: `https://castrojo.github.io/endusers-website/` | Branch: `main`

## Skills

```bash
cat skills/SKILL.md                        # repo operational knowledge
cat ~/src/skills/cncf-dev/SKILL.md         # cross-site architecture, layout, SiteSwitcher
cat ~/src/skills/cncf-layout/SKILL.md      # header spec, CSS rules
cat ~/src/skills/cncf-testing/SKILL.md     # test pyramid, Playwright patterns
```

## Quick Start

```bash
just serve        # build container → run on :8082 → open browser
just sync-dev     # Go sync + Astro hot-reload (fast UI iteration)
just test         # npx vitest run
just test-e2e     # npx playwright test
```

## Critical Rules

- **154 end-users only** — Go backend filters `CNCF Members` AND `item.EndUser == true`; do not revert
- **TDD required** — tests must be RED before implementing; `just test` must pass before commit
- **Richness tests only** — never test class names or element existence; test actual content values
- **Logic in .ts** — never put business logic directly in .astro files; extract to `src/lib/*.ts`
- **MCP for queries** — use `cncf-landscape` MCP (`query_members`); never fetch full.json manually

## Work Queue

```bash
gh issue list --repo castrojo/endusers-website --label copilot-ready --state open
```

## Session End

```bash
supermemory(mode="add", type="conversation", scope="project", content="[WHAT]...[WHY]...[FIX]...[NEXT]...")
```
