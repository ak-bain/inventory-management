# Shell: sidebar geometry, nav generation, responsive behaviour

## How to read the confidence tags

- `[verified]` — read out of a primary source during authoring; the source is named inline.
- `[convention]` — a defensible default derived from `[verified]` anchors. Deviate if the app has
  a reason to. Do not quote it back to the user as a specification.

## Geometry

| Property | Value | Confidence |
|---|---|---|
| Sidebar expanded width | **256px** (`16rem`) | `[verified]` — shadcn `SIDEBAR_WIDTH = "16rem"` in `registry/new-york-v4/ui/sidebar.tsx`. Material 3's standard navigation drawer agrees at 256dp. |
| Sidebar width on mobile overlay | **288px** (`18rem`) | `[verified]` — shadcn `SIDEBAR_WIDTH_MOBILE = "18rem"`, same file. |
| Collapsed icon rail width | **56px** | `[convention]` — see below. |
| Nav item height | **40px** | `[convention]` — see below. |
| Nav item radius | **8px** | `[verified]` — shadcn's sidebar menu button is `rounded-md`; with its default `--radius: 0.625rem` and `--radius-md: calc(var(--radius) * 0.8)`, that resolves to 8px. |
| Nav item horizontal padding | **8px** | `[verified]` — shadcn's sidebar menu button is `p-2`. 12px is a fine `[convention]` alternative on a 256px rail. |
| Gap between nav items | **4px** | `[convention]` — one spacing step. |
| Sidebar block padding | **8px** | `[convention]` — makes the 8px item radius concentric with a 16px container radius if the sidebar is a floating card. |

### Why the collapsed rail is 56px and not the number you remember

The two primary sources disagree, so neither can be quoted as *the* spec:

- shadcn ships **48px** — `SIDEBAR_WIDTH_ICON = "3rem"` `[verified]`.
- Material 3's navigation rail container is **80dp** `[verified]`, a wider component built for
  icon-plus-label stacks rather than an icon-only collapse of a drawer.

56px is derived, not recalled: a 40px nav button with 8px padding on each side. It clears the
40x40 dense-desktop hit-area minimum in `polish.md`, and it sits between the two anchors. If the
product is touch-first, use **64px** instead — 48px button plus 8px each side, which clears the
44x44 touch minimum. Both are `[convention]`; state them that way.

### Why the nav item is 40px and not the number you remember

- shadcn's default sidebar menu button is **32px** (`h-8`) `[verified]`.
- Material 3's navigation drawer item is **56dp** `[verified]`.

40px is the smallest height that satisfies `polish.md`'s "at least 40x40px in dense desktop
interfaces" without a pseudo-element extending the hit area. That derivation is the whole
justification — it is a `[convention]`, and 32px with an extended hit area is equally correct.

## Shell layout

Flipping the axis is usually one declaration. Find the rule that stacks header above content and
convert the container to a two-column grid.

```css
/* before: .app { display: flex; flex-direction: column; } */
.app {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
}
:root { --sidebar-width: 256px; --sidebar-width-collapsed: 56px; }
.app[data-sidebar="collapsed"] { --sidebar-width: var(--sidebar-width-collapsed); }
```

`minmax(0, 1fr)` on the content column, not `1fr`. A bare `1fr` has `min-width: auto`, so a wide
table or a long unbroken string will blow the grid out and push the sidebar off-screen. This is
the single most common way a sidebar conversion breaks.

The sidebar itself is `position: sticky; top: 0; height: 100vh; overflow-y: auto`, so long nav
lists scroll independently of the page.

## Nav item states

```css
.nav-item {
  display: flex; align-items: center; gap: var(--space-2);
  height: 40px; padding: 0 var(--space-2); border-radius: var(--radius-md);
  color: var(--sidebar-foreground); font-size: var(--text-sm); font-weight: 500;
  transition-property: background-color, color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
}
.nav-item:hover              { background: var(--sidebar-accent); color: var(--sidebar-accent-foreground); }
.nav-item:focus-visible      { outline: 2px solid var(--sidebar-ring); outline-offset: 2px; }
.nav-item[aria-current="page"] {
  background: var(--sidebar-accent);
  color: var(--sidebar-accent-foreground);
  font-weight: 600;
}
```

The active state is a soft tinted fill plus darker, bolder text — never color alone (WCAG SC
1.4.1). A 2-3px left edge bar is an optional third cue; if you add one, inset it so it does not
change the item's box, and give the item `position: relative` with a `::before`.

Nav transitions are high-frequency, so they get a `<=150ms` color transition and nothing else.
See "Motion Restraint" in `polish.md`.

## Generating nav items from the router

Read the route list rather than hardcoding a second copy of it. Vue Router exposes
`router.getRoutes()`; if the routes are declared inline in `main.js`, export the array and import
it into the nav component instead of duplicating the literals.

Attach nav metadata to the route definitions so the route table stays the single source of truth:

```js
{ path: '/inventory', component: Inventory,
  meta: { nav: { labelKey: 'nav.inventory', icon: 'boxes', order: 2 } } }
```

Then the nav is derived:

```js
const items = computed(() =>
  router.getRoutes()
    .filter(r => r.meta?.nav)
    .sort((a, b) => a.meta.nav.order - b.meta.nav.order)
);
```

Rules for this step:

- **Routes without `meta.nav` do not appear.** That is how you keep detail and utility routes out
  of the nav without maintaining an exclusion list.
- **Every label goes through the app's i18n function.** If Phase 0 found a hardcoded label among
  translated siblings, add the missing key to *every* locale file. A missing key that falls back
  to the key name is a visible regression, not a silent one.
- **Preserve the previous visual order,** which is frequently not the route declaration order.
  Capture the old order in Phase 0 and encode it in `meta.nav.order`.
- Mark the active item with `aria-current="page"`, driven by the router's own active state rather
  than a hand-rolled path comparison.

## Re-anchoring offsets

Every offset Phase 0 found that was hardcoded to the old header height is now wrong. Replace the
literals with a variable, then set the variable once.

```css
:root { --header-height: 56px; }        /* 0 if the top bar is removed entirely */
.filter-bar { position: sticky; top: var(--header-height); }
```

If the top bar is removed, the offset becomes `0` and the sticky element anchors to the viewport.
If a slim top bar survives inside the content column, the offset is that bar's height. Either way
the number appears exactly once.

The same applies to the centering contexts. Multiple `max-width: Npx; margin: 0 auto` blocks were
each compensating for a full-width header. Once content lives in a grid column, delete them and
let one wrapper inside the content column own the max-width and the horizontal padding.

## Header affordances

A language switcher, profile menu, or notification bell that lived in the top bar needs a new
home. In order of preference:

1. **Sidebar footer** — a `margin-top: auto` block at the bottom of the sidebar. Best for account
   and settings controls.
2. **Slim top bar inside the content column** — 48-56px, holding page title, search, and primary
   action. Use when the app needs a per-page action row.
3. **Sidebar header** — logo plus workspace switcher only.

Do not keep the old full-width header above the sidebar. That produces an "L" shell, which
reintroduces every offset you just removed and wastes the vertical space the conversion bought.

Dropdowns that were positioned against the old header need their anchor rechecked; a menu that
opened downward from a top bar may need to open upward from a sidebar footer.

## Responsive behaviour

| Width | Behaviour |
|---|---|
| `>= 1024px` | Sidebar expanded, in flow, 256px |
| `768px - 1023px` | Collapsed icon rail, 56px, labels in tooltips |
| `< 768px` | Off-canvas drawer, 288px, over a scrim, closed by default |

```css
@media (max-width: 1023px) { :root { --sidebar-width: var(--sidebar-width-collapsed); } }
@media (max-width: 767px)  {
  .app { grid-template-columns: minmax(0, 1fr); }
  .sidebar { position: fixed; inset: 0 auto 0 0; width: 288px; transform: translateX(-100%); }
  .app[data-sidebar="open"] .sidebar { transform: translateX(0); }
}
```

The drawer slides with a CSS **transition**, not a keyframe animation, so a user who toggles
mid-slide gets a smooth reversal instead of a restart. See "Interruptible Animations" in
`polish.md`.

Drawer requirements: closes on Escape and on scrim click, returns focus to the trigger, traps
focus while open, and sets `aria-expanded` on the trigger. The toggle button is the one control
that must exist at every width.

## Accessibility checklist for the shell

- Sidebar is `<nav aria-label="Main">`; the content column is `<main>`.
- A skip link to `#main` is the first focusable element on the page.
- Active item is `aria-current="page"`.
- In the collapsed rail, each icon-only link keeps an accessible name — a visually hidden label or
  `aria-label`. A tooltip alone is not an accessible name.
- Focus rings use `--sidebar-ring` at `outline-offset: 2px` so the ring is not clipped by the
  item's own background.
- A sticky sidebar or top bar must not cover a focused element (SC 2.4.11, **AA**). Tab through
  the whole page after the conversion and watch for a focus ring disappearing under sticky
  chrome. Add `scroll-margin-top: var(--header-height)` to focusable content if it does.
