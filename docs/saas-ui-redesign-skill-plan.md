# Build the `saas-ui-redesign` skill

## Context

The user wants a reusable Claude Code **skill** — not a one-off redesign — that converts a
Vue 3 app with a top nav bar into a modern SaaS-style interface: left vertical navigation
sidebar, a consistent spacing scale, and a polished professional surface/typography treatment.

The skill is authored here (this repo's Vue app is the first real test case) but is written to
be repo-agnostic so it works on any Vue 3 project.

Decisions confirmed with the user:

| Decision | Choice |
|---|---|
| Scope | Repo-agnostic; the skill discovers router/shell/styles rather than hardcoding paths |
| Autonomy | Two-phase — tokens + shell + ONE converted route, screenshot checkpoint, then the rest |
| Palette | Ship a fixed vetted palette; **no runtime generation** |
| Polish rules | Vendor from `make-interfaces-feel-better` — license checked, MIT, cleared |
| Location | `.claude/skills/saas-ui-redesign/` — committed to this repo |
| Verification | Playwright screenshots of every route, parallelized |

Two constraints drove several choices: the venue network is slow, so the skill makes **zero
network calls at runtime**; and this repo is **public**, so vendored third-party content is a
redistribution question, not just an attribution one.

---

## Vendoring gate — RESOLVED: cleared

`jakubkrehel/make-interfaces-feel-better` is **MIT licensed**. Verified by reading the LICENSE
file directly, not inferred from the repo being public.

- License: **MIT**
- Copyright line: `Copyright (c) 2026 Jakub Krehel`
- HEAD commit at time of check: `5a4076ac611d6610b9cb4d67f5275cb4f869411b`

MIT grants the right to "use, copy, modify, merge, publish, distribute" without restriction,
so vendoring modified excerpts into this public repo is permitted. The one binding condition:

> "The above copyright notice and this permission notice shall be included in all copies or
> substantial portions of the Software."

**Therefore `references/polish.md` must carry the FULL MIT permission notice**, not merely a
credit line — a one-line "adapted from…" does not satisfy the clause. Its header must include:
the copyright line verbatim, the complete MIT text, the source repo URL, and the commit SHA
above so the provenance is pinned to a specific revision.

---

## Skill structure

Follows the pattern proven by the built-in `dataviz` skill and the house rules found in
`skill-creator`/`plugin-dev`: **lean SKILL.md (under 3,000 words) as a numbered imperative
procedure, with each step's reference pointer inlined at point of use, plus one final
"diff your output against this" gate.** This deviates from the repo's only existing skill
(`backend-api-test`, a single 497-line file with no `references/`) — justified, because that
one is a style guide while this is a multi-phase procedure.

```
.claude/skills/saas-ui-redesign/
  SKILL.md              # procedure, non-negotiables, reference index
  references/
    discovery.md        # how to survey an unknown Vue app + the gotcha catalog
    tokens.md           # the vetted palette, spacing scale, type scale
    shell.md            # sidebar spec, nav generation, responsive/collapse
    polish.md           # micro-polish rules (gated above)
    anti-patterns.md    # final self-check catalog
  scripts/
    check_contrast.mjs  # runnable WCAG AA validator
```

**Frontmatter** — third-person, specific trigger phrases, with a hard "read BEFORE" clause,
mirroring `dataviz`. Include triggers: "sidebar", "vertical nav", "modern SaaS", "redesign the
UI", "app shell", "design tokens", "make it look professional". Omit `allowed-tools` (neither
`dataviz`, `frontend-design`, nor this repo's existing skill sets it).

---

## The procedure SKILL.md encodes

**Phase 0 — Discover** (→ `references/discovery.md`). Never assume file layout. Locate the
router (may be inline in `main.js`, not a `router/` dir), the layout shell, and where global
styles live. Then run the gotcha sweep, generalized from what this app actually contains:

- Sticky offsets hardcoded to the current header height (here: `FilterBar.vue`'s `top: 70px`).
- Multiple independent `max-width` + `margin: 0 auto` centering contexts (here: three).
- Per-view `<style scoped>` blocks that **redefine global classes with different values**
  (here `Reports.vue` and `Inventory.vue` override `.card`/`.badge`/`.page-header`) — restyling
  globals alone leaves these out of sync.
- Nav labels hardcoded in one language while siblings are i18n'd (here: "Reports").
- Orphaned views not reachable from any route (here: `views/Backlog.vue`).
- Absent shared primitives — count duplicated modal/button implementations before adding more.
- Count hardcoded color literals to size the token work (here: ~464 across 17 files).

Report the survey to the user before editing anything.

**Phase 1 — Token layer** (→ `references/tokens.md`). Introduce `:root` custom properties, then
map existing literals onto them. Where an app has zero custom properties (this one does), this
is net-new, so derive tokens from the app's *existing* de-facto palette rather than recoloring
it — the redesign is structural, not a rebrand.

**Phase 2 — Sidebar shell** (→ `references/shell.md`). Flip the shell axis (here: the single
line `.app { flex-direction: column }` → a grid/row shell), extract a `SidebarNav` component,
generate nav items from the router's route list, and re-anchor every offset found in Phase 0.
Move header-only affordances (language switcher, profile menu) into a sidebar footer or slim
top bar.

**Phase 3 — Checkpoint.** Convert exactly ONE representative route, screenshot it, and stop
for the user's go-ahead before touching the rest. This is the user's explicit requirement.

**Phase 4 — Remaining views.** Convert the rest, and reconcile the scoped overrides found in
Phase 0 rather than leaving two competing definitions of `.card`.

**Phase 5 — Polish pass** (→ `references/polish.md`). Vendored rules are concrete constants —
concentric border radius (outer = inner + padding), `scale(0.96)` on press, `ease-out` for both
enter and exit, ~100ms stagger for staged entrances only, `tabular-nums` on dynamic figures,
44×44 minimum hit areas, icons recolored via `currentColor`, never `transition: all`.

**Phase 6 — Verify** (below), then diff against `references/anti-patterns.md`.

---

## Specs to bake into the reference files

**Palette** (`tokens.md`) — all MIT, safe to copy verbatim:
- shadcn/ui default theme, including its dedicated `--sidebar` / `--sidebar-foreground` /
  `--sidebar-accent` / `--sidebar-border` / `--sidebar-ring` set, which maps 1:1 onto this
  skill's needs. Source: https://ui.shadcn.com/docs/theming
- Radix Colors 12-step ramp with its step→role convention (1–2 backgrounds, 3–5 UI surfaces,
  6–8 borders, 9–10 solid, 11–12 text). Take values from the `@radix-ui/colors` package, **not**
  the marketing site, which renders via JS.
- **Do NOT copy:** Geist (no confirmed open license on its values), Tailwind UI (paid),
  Untitled UI (Figma licensing).

**Layout** (`shell.md`) — carry the confidence tags through into the file, and resolve the
`[verify-later]` items with one verification pass during implementation:
- Sidebar expanded **256px** (`16rem`) — shadcn's documented default; Material's drawer spec
  agrees at 256dp. `[certain]`
- Collapsed icon rail **~56–64px**; exact M3 navigation-rail dp and shadcn's collapsed token
  are `[verify-later]`.
- Spacing scale, 4px base: **4 / 8 / 12 / 16 / 24 / 32 / 48 / 64**. `[certain]` — Tailwind's
  default scale and *Refactoring UI*'s explicit "limit yourself to a fixed scale" rule.
- Type scale **12 / 14 / 16 / 18 / 20 / 24 / 30 / 36px**; dense dashboard body text 14px.
  `[certain]`
- Nav item 36–40px height, 8px radius, 12px horizontal padding. `[verify-later]`
- Surfaces: **borders for structure, large soft low-opacity shadows for elevation** — never
  small dark shadows. `[certain]`, *Refactoring UI*.
- Active nav state: soft tinted background + darker/bolder text, optionally a 2–3px left edge
  bar. Never rely on color alone.

**Accessibility** (`tokens.md` + the validator):
- 4.5:1 body text, 3:1 large text (WCAG 1.4.3); 3:1 UI components and borders (1.4.11).
- 2.4.11 Focus Not Obscured is **AA**; 2.4.13 Focus Appearance is **AAA** — label the tiers
  correctly so the skill doesn't over-claim.

**`scripts/check_contrast.mjs`** — mimic the interface of `dataviz`'s `validate_palette.js`
(that script lives compiled inside the Claude Code binary, not on disk, so it can be imitated
but not imported): accept a hex list plus `--mode light|dark` and `--surface #hex`, print
`[PASS]`/`[WARN]`/`[FAIL]` per check, exit 0 on pass, 1 on any FAIL, 2 on usage error. No
dependencies. The rule to state in SKILL.md: **run the validator, never eyeball contrast.**

---

## Verification

No `mcp__playwright__*` server is connected in this session, so the skill must branch:
prefer `mcp__playwright__*` when available, else invoke the **`playwright-cdp`** skill.

Per the user's parallelization requirement: screenshot routes **concurrently** by fanning
routes out across subagents driving separate browser windows (a pattern `playwright-cdp`
explicitly supports), rather than serially navigating one window. Capture desktop plus one
narrow width per route.

End-to-end check of the finished skill:
1. `/start` (or `cd server && uv run python main.py` + `cd client && npm run dev`).
2. Invoke the skill on this app; confirm Phase 0 reports the known gotchas — the `top: 70px`
   coupling, the two scope-override views, the orphaned `Backlog.vue`. **If it misses those,
   the discovery reference is the thing to fix**, since this repo is its test fixture.
3. Confirm it stops at the Phase 3 checkpoint instead of converting everything.
4. Run `scripts/check_contrast.mjs` on the resulting sidebar tokens; expect exit 0.
5. Screenshot all 6 routes; verify no view is visually out of sync with the others.
6. `git diff` — confirm no credentials, internal hostnames, or registry URLs, and that
   `client/.npmrc` and the `package-lock.json` gitignore rule are untouched (CLAUDE.md).

## Open items to close during implementation

- ~~Read that LICENSE and take the documented branch.~~ **Done — MIT, vendoring cleared.**
- Resolve the four `[verify-later]` numbers, or state them as conventions rather than specs.
- Confirm the Open Color repo path if it gets cited (`yeun/open-color`, unverified).
