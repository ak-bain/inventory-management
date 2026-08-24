# Anti-patterns: diff your output against this before reporting done

This is the final gate. Go through every item against the actual diff — not against your memory
of what you intended. For each one, either confirm it does not appear or fix it. Report anything
you deliberately left in place, with the reason.

## Process

**Converting everything in one pass.** Phase 3 is a hard stop. One route, one screenshot, then
wait. A batch conversion that arrives all at once cannot be course-corrected, and the user
explicitly asked not to receive one.

**Editing before surveying.** The gotcha sweep exists because the couplings it finds are
invisible in the diff. Skipping it converts the shell and leaves half the app subtly broken.

**Recoloring the app while restructuring it.** The redesign is structural. Derive tokens from the
app's existing de-facto palette; do not deliver a rebrand the user did not ask for.

**Fetching anything at runtime.** No package installs, no palette generators, no remote schemas,
no documentation lookups. Every constant needed is in `tokens.md` and `shell.md`.

**Silent scope expansion.** Extracting a shared modal or button primitive, deleting an orphaned
view, renaming routes — all tempting mid-conversion, all out of scope. Propose them; do not do
them.

## Layout

**`grid-template-columns: 256px 1fr`.** Use `minmax(0, 1fr)` for the content column. A bare `1fr`
resolves `min-width: auto`, so one wide table pushes the sidebar off-screen.

**Keeping the full-width header above the sidebar.** That "L" shell reintroduces every offset the
conversion removed and wastes the vertical space it bought. Header affordances move into the
sidebar footer or a slim bar inside the content column.

**Leaving the old centering wrappers in place.** Multiple `max-width` + `margin: 0 auto` contexts
were compensating for a full-bleed header. Inside a grid column they fight each other. One
wrapper owns max-width and horizontal padding.

**A sticky offset still hardcoded to the old header height.** After the conversion, `top: 70px`
anchors to a header that no longer exists. Every offset resolves through one variable.

**A fixed-height sidebar that cannot scroll.** `height: 100vh; overflow-y: auto` on the sidebar,
or a long nav list is unreachable.

## Tokens

**A hex literal and a token expressing the same role in the same file.** Phase 1 exists to end
that state. Grep the diff for surviving literals.

**Inventing an in-between spacing value.** `18px`, `0.875rem`, `22px` — snap to
4/8/12/16/24/32/48/64. The scale only works if it is the only source of values.

**Tokens named for their color.** `--gray-light`, `--blue-dark` re-break the moment the theme
changes. Name the role: `--muted-foreground`, `--border-strong`.

**A "strong" border built from a mid neutral.** No Radix slate step below 9 reaches 3:1 on white;
slate-8 measures 1.91:1. A border that carries meaning needs step 9 or darker.

**White text on a step-9 solid.** Measures 3.26:1 on blue-9 and 1.58:1 on amber-9. Use step 11 as
the fill for body-size button text, or put step-12 ink on the step-9 fill.

**Step-11 text on a step-3 chip.** Lands at 4.21-4.54:1 — most hues miss AA. Chips take step-12 ink.

**Eyeballing contrast.** Run `scripts/check_contrast.mjs`. Every claim about a ratio in your
report must come from its output.

## Navigation

**A hardcoded nav array beside the route table.** Two lists that must agree will stop agreeing.
Generate from `router.getRoutes()` and filter on `meta.nav`.

**Route declaration order used as nav order.** It is usually not the previous visual order.
Encode the intended order explicitly.

**Orphaned views promoted into the nav.** A view with no route is not a destination. Report it,
leave it.

**A label hardcoded in one language beside translated siblings.** The conversion is when this
becomes visible. Add the key to every locale file, not just the default.

**Active state signalled by color alone.** Fails WCAG SC 1.4.1. Pair the tint with weight, and
optionally an edge bar.

**A hand-rolled `$route.path === '/x'` comparison.** Use the router's own active state, and mark
the item `aria-current="page"`.

**An icon-only rail with no accessible names.** A tooltip is not an accessible name. Each link
keeps a visually hidden label or an `aria-label`.

## Views

**Restyling the global class and stopping there.** Any view whose `<style scoped>` shadows that
class keeps the old design. Reconcile every shadow found in the survey.

**Reconciling by deleting the global.** Some shadows are intentional local variants. Decide per
case: conflict (reconcile), dead duplicate (delete the scoped copy), variant (promote to a
modifier).

**Converting the easiest route at the checkpoint.** The checkpoint route must exercise the shared
surfaces — cards, tables, badges, filters, charts. A near-empty route proves nothing.

**Two competing definitions of `.card` left in the tree.** If reconciliation is genuinely out of
scope for one view, say so explicitly rather than leaving it for the reader to discover.

## Polish

**`transition: all`.** Name the properties.

**A keyframe animation on an interactive element.** Drawers, collapses, and toggles use
transitions so a mid-flight reversal is smooth.

**Staggered entrances on high-frequency interactions.** Row hovers and tab switches get `<=150ms`
color transitions, nothing more.

**Equal border radius on nested surfaces.** `outerRadius = innerRadius + padding`.

**A small dark shadow for elevation.** Large, soft, low-opacity. Small and dark reads as a smudge.

**Proportional digits on figures that update.** `font-variant-numeric: tabular-nums`.

**A tinted image outline.** Pure black or pure white at 0.1 alpha. A tinted near-black reads as
dirt on the edge.

**`scale` below 0.95 on press.** Always `0.96`.

**A new dependency added for polish.** Motion libraries, icon packages, CSS frameworks — none of
them. The CSS cross-fade pattern covers the icon case without one.

**Hit areas under 40x40 in dense UI, or under 44x44 for touch.** Extend with a pseudo-element,
and never let two hit areas overlap.

## Accessibility

**No skip link.** First focusable element on the page, targeting `<main>`.

**Focus ring clipped or hidden under sticky chrome.** SC 2.4.11 Focus Not Obscured (Minimum) is
**AA**. Tab the whole page after the conversion.

**Over-claiming the AA tier.** SC 2.4.13 Focus Appearance is **AAA**. Meet it if you can; do not
describe it as required for AA.

**A drawer that traps the user.** Closes on Escape and on scrim click, restores focus to the
trigger, traps focus while open, sets `aria-expanded`.

**Unlabelled landmarks.** Sidebar is `<nav aria-label="Main">`; content is `<main>`.

## Reporting

**Claiming a route is converted without a screenshot.** Every route gets a desktop and a narrow
capture.

**Claiming contrast passes without validator output.** Paste the output.

**Reporting a number this skill labels a `[convention]` as if it were a specification.** The
collapsed rail width and the nav item height are conventions derived from hit-area minimums, not
published specs. Say so.

**Burying what you did not do.** Anything left unreconciled, unconverted, or unverified goes in
the report as its own line, not inside a paragraph of successes.
