---
name: saas-ui-redesign
description: Converts a Vue 3 application from a top navigation bar to a modern SaaS-style left sidebar shell, adding a vetted design-token layer, a consistent spacing and type scale, and an interface polish pass. Use this skill when the user asks for a sidebar, vertical nav, app shell, modern SaaS look, design tokens, a UI redesign, or to make an interface look professional. Read the reference file named at each step BEFORE writing any code for that step — the palette, the geometry, and the license-bound polish rules live in references/, not in this file.
---

# SaaS UI redesign

Turns a Vue 3 app with a top nav bar into a left-sidebar SaaS shell, in six phases with a
mandatory checkpoint after the first converted route.

This skill is repo-agnostic. Discover the app's structure; never assume its file layout.

## Non-negotiables

1. **Zero network calls.** No package installs, no palette generators, no remote lookups. Every
   constant you need is already in `references/`.
2. **Phase 3 is a hard stop.** Convert one route, screenshot it, and wait for the user. Do not
   convert the rest in the same pass.
3. **Run the contrast validator. Never eyeball contrast.** Every ratio you report comes from
   `scripts/check_contrast.mjs` output.
4. **Copy palette values only from MIT sources** — shadcn/ui, Radix Colors, Tailwind, Open Color.
   Never Geist, Tailwind UI, or Untitled UI.
5. **Do not add dependencies.** Not a motion library, not an icon package, not a CSS framework.
6. **Survey before editing**, and report the survey before editing.

---

## Phase 0 — Discover

**Read `references/discovery.md` now.** It has the search commands, the gotcha catalog, and the
report template. Run every sweep in it; a sweep that finds nothing is still a reportable result.

1. Locate the three anchors: the **router** (it is often inline in `main.js`, not a `router/`
   directory), the **shell** component that renders `<router-view />`, and where **global styles**
   live.
2. Run the gotcha sweep. You are looking for: sticky offsets hardcoded to the current header
   height; multiple independent `max-width` + `margin: 0 auto` centering contexts; per-view
   `<style scoped>` blocks that redefine global classes with different values; nav labels
   hardcoded in one language while siblings are translated; views unreachable from any route;
   duplicated modal and button implementations; and the count of hardcoded color literals and
   existing custom properties.
3. Choose the route for the Phase 3 checkpoint. Pick the one exercising the most shared surfaces —
   cards, tables, badges, filters, charts — not the simplest one.
4. **Report the survey to the user and name what you are treating as out of scope.** Then continue.

The scoped-override sweep is the one most likely to be skipped and most likely to cause visible
breakage: restyling a global `.card` leaves every view that shadows `.card` looking like the old
design.

---

## Phase 1 — Token layer

**Read `references/tokens.md` now.** It contains the full palette with measured contrast ratios,
the spacing and type scales, the radius scale, the elevation shadows, and the literal-to-token
mapping procedure.

5. Add the `:root` custom-property block — ramps first, then the semantic layer — to the global
   stylesheet you identified in Phase 0.
6. Map the app's existing literals onto the tokens by **role**, not by color. Rank the literals by
   frequency first; the top of that list is the app's real de-facto palette.
7. Where the app has a genuine brand hue, keep the hue and substitute it into `--primary`, then
   re-run the validator against it. A brand color that fails 4.5:1 under white text needs a
   darkened variant for text use, not a waiver.
8. Snap ad-hoc spacing values to the 4/8/12/16/24/32/48/64 scale. Snapping is the point.
9. Run the validator on the resulting token set:

   ```bash
   node .claude/skills/saas-ui-redesign/scripts/check_contrast.mjs \
     --mode light --surface '#ffffff' \
     foreground='#1c2024' muted-foreground='#60646c' primary='#0d74ce' \
     border-strong='#8b8d98:ui' ring='#0090ff:ui' border='#d9d9e0:decorative'
   ```

   Entries take the form `[name=]#hex[:role]`, where role is `text` (4.5:1), `large` (3:1), `ui`
   (3:1), or `decorative` (reported, never fails). It exits 0 when nothing fails, 1 on any FAIL,
   2 on a usage error. Run it once per surface — the surface argument changes the result.

This phase is structural, not a rebrand. The app should still look like itself when it ends.

---

## Phase 2 — Sidebar shell

**Read `references/shell.md` now.** It has the verified geometry, the confidence tags, the
nav-generation pattern, and the responsive breakpoints.

10. Flip the shell axis. This is usually a single rule: the container that stacked header above
    content becomes `display: grid; grid-template-columns: var(--sidebar-width) minmax(0, 1fr)`.
    Use `minmax(0, 1fr)`, never a bare `1fr` — a bare `1fr` lets one wide table push the sidebar
    off-screen.
11. Extract a `SidebarNav` component. Generate its items from the router's route list, filtered on
    a `meta.nav` field, rather than hardcoding a second copy of the routes. If the routes are
    declared inline in the entry point, export the array and import it.
12. Route every label through the app's i18n function, and add any missing key to **every** locale
    file. Preserve the previous visual nav order, which is frequently not the route declaration
    order.
13. Re-anchor every offset Phase 0 found. Replace each hardcoded header-height literal with
    `var(--header-height)` and set that variable once. Leave sticky elements that anchor to a
    scroll container alone.
14. Consolidate the centering contexts. One wrapper inside the content column owns the max-width
    and the horizontal padding; delete the others.
15. Move header-only affordances — language switcher, profile menu, notifications — into a sidebar
    footer or a slim top bar **inside** the content column. Do not keep a full-width header above
    the sidebar; that "L" shell reintroduces every offset you just removed.
16. Implement the responsive behaviour: expanded at `>=1024px`, collapsed icon rail below that,
    off-canvas drawer below `768px`. The drawer slides with a CSS transition, not a keyframe
    animation, so a mid-slide toggle reverses smoothly.

Geometry numbers in `shell.md` are tagged `[verified]` or `[convention]`. Carry the tags into
anything you tell the user. The sidebar's 256px expanded width is verified from shadcn's source;
the collapsed rail width and the nav item height are conventions derived from hit-area minimums,
because the primary sources disagree.

---

## Phase 3 — Checkpoint. Stop here.

17. Convert **exactly one** route — the one chosen in Phase 0.
18. Screenshot it at desktop width and one narrow width (see Phase 6 for how).
19. Run the validator against the sidebar tokens as actually rendered. Expect exit 0.
20. **Report and stop.** Show the screenshots, the validator output, what changed, and what you
    propose for the remaining routes. Then wait for the user's go-ahead.

Do not begin Phase 4 in the same turn. Do not convert "just one more" route because it looked
quick. This checkpoint is the user's explicit requirement, and a batch conversion that arrives all
at once cannot be course-corrected.

---

## Phase 4 — Remaining views

21. Convert the rest of the routes, one at a time, in the order you proposed.
22. Reconcile every scoped override found in Phase 0. Each one is a conflict (reconcile to a
    single definition), a dead duplicate (delete the scoped copy), or a deliberate variant
    (promote it to a modifier class). Decide per case; do not leave two competing definitions of
    `.card` in the tree.
23. Leave the out-of-scope items out of scope. Extracting a shared modal or button primitive,
    deleting an orphaned view, renaming routes — propose them as follow-up work.

---

## Phase 5 — Polish

**Read `references/polish.md` now.** Its rules are vendored under the MIT License and the file
carries the required copyright and permission notice; do not strip that header, and carry it with
any copy you make of those rules.

24. Apply the polish pass to the converted UI. The constants are concrete: concentric border radius
    (`outer = inner + padding`), `scale(0.96)` on press, `ease-out` for both enter and exit,
    ~100ms stagger for staged entrances only, `tabular-nums` on every figure that updates, 44x44
    minimum hit areas (40x40 in dense desktop UI), icons recolored via `currentColor`, and never
    `transition: all`.
25. Express every fix in the styling system the project already uses. Plain CSS project, plain CSS
    fix. Never introduce a second styling system to satisfy a polish rule.

Polish comes after the layout is settled. Applied earlier, it is thrown away.

---

## Phase 6 — Verify

26. Screenshot every route at desktop and one narrow width. Prefer `mcp__playwright__*` tools when
    a Playwright MCP server is connected; when it is not, use the **`playwright-cdp`** skill,
    which drives Chromium over the DevTools Protocol with no MCP configuration.
27. **Parallelize.** Fan the routes out across subagents driving separate browser windows rather
    than navigating one window serially. `playwright-cdp` supports this explicitly.
28. Compare the captures against each other. A view that is visually out of sync with its siblings
    is an unreconciled scoped override from Phase 4 — go back and fix it.
29. Re-run `scripts/check_contrast.mjs` on the final token values and paste the output.
30. Run `git diff` and confirm no credentials, internal hostnames, or private registry URLs
    entered the tree, and that registry-pinning files were not modified.

---

## Final gate

31. **Read `references/anti-patterns.md` and diff your actual output against every item in it.**
    Not against your memory of what you intended — against the diff.

For each item, either confirm it does not appear or fix it. Anything you deliberately left in
place goes in the report with its reason, on its own line. Anything you did not do, could not
verify, or left unreconciled goes in the report too — as its own line, not buried inside a
paragraph of successes.
