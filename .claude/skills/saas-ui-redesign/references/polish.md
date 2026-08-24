# Polish

<!--
  ATTRIBUTION AND LICENSE
  ======================
  The interface-polish rules in this file are adapted from the `make-interfaces-feel-better`
  skill.

  Source repository: https://github.com/jakubkrehel/make-interfaces-feel-better
  Pinned revision:   5a4076ac611d6610b9cb4d67f5275cb4f869411b
  License:           MIT

  The MIT License requires that the copyright notice and the full permission notice be included
  in all copies or substantial portions of the Software. Both are reproduced below in full. Do
  not remove or abridge this block. If you copy these rules onward, carry it with them.

  ----------------------------------------------------------------------------------------------
  MIT License

  Copyright (c) 2026 Jakub Krehel

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  ----------------------------------------------------------------------------------------------

  Modifications: the rules have been condensed, reordered for this skill's phase sequence, and
  re-expressed in plain CSS and Vue rather than Tailwind and React, since this skill targets
  Vue 3 applications that generally have no Tailwind and no motion library. The constants are
  reproduced unchanged.
-->

> The rules below are adapted from `make-interfaces-feel-better` by Jakub Krehel (MIT). The full
> copyright and permission notice is in the comment block at the top of this file and must travel
> with any copy of these rules.

Apply this pass **after** the shell and the views are converted, never before. Polish applied to
a layout that is about to change is thrown away.

Express every fix in the styling system the project already uses. If the project is plain CSS
with scoped `<style>` blocks, write plain CSS. Never introduce a second styling system — or a new
dependency — to satisfy a polish rule.

When reviewing your own work, slow the interface down: replay motion at 10% speed in the
browser's animation panel and walk every state — hover, focus, active, loading, empty. What feels
off at 10% speed is what is subtly wrong at full speed.

## Surfaces

**Concentric border radius.** `outerRadius = innerRadius + padding`. Mismatched radii on nested
elements is the most common thing that makes an interface feel off.

```css
.card       { border-radius: 20px; padding: 8px; }  /* 12 + 8 */
.card-inner { border-radius: 12px; }
```

When the padding exceeds 24px, treat the layers as separate surfaces and choose each radius
independently instead of forcing the math.

**Shadows for elevation, borders for structure.** Replace a border that exists only to fake depth
with a layered transparent shadow — shadows adapt to any background, solid borders do not. Keep
borders that communicate structure or state: dividers, table cell boundaries, form input
outlines, selected and focus states.

```css
:root {
  --shadow-border:       0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06),
                         0 2px 4px 0 oklch(0 0 0 / 0.04);
  --shadow-border-hover: 0 0 0 1px oklch(0 0 0 / 0.08), 0 1px 2px -1px oklch(0 0 0 / 0.08),
                         0 2px 4px 0 oklch(0 0 0 / 0.06);
}
```

In dark mode this collapses to a single white ring — layered depth shadows are invisible on dark
backgrounds: `0 0 0 1px oklch(1 0 0 / 0.08)`, and `/ 0.13` on hover.

**Optical over geometric alignment.** When geometric centering looks off, align optically. For a
button with a trailing icon, the icon-side padding is the text-side padding minus 2px. Play
triangles shift ~2px right. For asymmetric icons the best fix is the SVG itself, not a margin.

**Image outlines.** Add a 1px inset outline to images: `outline: 1px solid oklch(0 0 0 / 0.1);
outline-offset: -1px` in light mode, `oklch(1 0 0 / 0.1)` in dark. The color must be pure black or
pure white — never a tinted near-black like slate-900 or zinc-900, which picks up the surface
underneath and reads as dirt on the image edge. `outline` rather than `border` because it does not
affect layout.

**Minimum hit area.** Prefer 44x44px for touch or mobile contexts; at least 40x40px in dense
desktop interfaces. Extend a smaller visible control with a pseudo-element:

```css
.checkbox { position: relative; width: 20px; height: 20px; }
.checkbox::after {
  content: ""; position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); width: 44px; height: 44px;
}
```

If the extended area would overlap a neighbouring control, shrink it — make it as large as
possible without colliding. Two interactive elements must never have overlapping hit areas.

## Animations

**Interruptible animations.** Use CSS transitions for interactive state changes; they retarget
mid-flight when the user changes intent. Reserve keyframes for staged sequences that run once. A
drawer driven by a keyframe animation snaps or restarts when toggled mid-slide.

**Split and stagger enter animations.** For an *infrequent* staged entrance where sequence
communicates hierarchy — a page hero, a success state, an empty state — break the content into
semantic chunks and stagger them by **~100ms** (~80ms for individual words in a title), combining
`opacity`, `translateY(12px)`, and `blur(4px)`. Do not stagger routine, high-frequency
interactions: row hovers, keystrokes, repeated tab changes.

**Subtle exit animations.** Use a small fixed `translateY` (e.g. `-12px`), never the full
container height. Exit duration is shorter than enter — 150ms against 300ms. Use `ease-out` for
both enter and exit. Remove immediately, with no animation, when motion adds no information or
reduced motion is requested.

**Contextual icon animations.** Animate icons with `opacity`, `scale`, and `blur` rather than
toggling visibility. Use exactly these values: scale `0.25` -> `1`, opacity `0` -> `1`, blur `4px`
-> `0px`. With a motion library installed, `transition: { type: "spring", duration: 0.3, bounce: 0 }`
— bounce is always `0`. With no motion library, keep both icons in the DOM (one absolutely
positioned) and cross-fade with CSS transitions using `cubic-bezier(0.2, 0, 0, 1)`. Never add a
dependency just for an icon transition.

**Scale on press.** `scale(0.96)` on `:active`, always `0.96`, never below `0.95` — smaller feels
exaggerated. Drive it with a transition so a mid-press release returns smoothly. Provide a way to
opt out where the motion would distract.

```css
.button        { transition-property: scale; transition-duration: 150ms; transition-timing-function: ease-out; }
.button:active { scale: 0.96; }
```

**Never `transition: all`.** Name the properties: `transition-property: scale, opacity`. A blanket
transition animates properties you did not intend, including layout ones.

**Use `will-change` sparingly.** Only for `transform`, `opacity`, `filter` — properties the GPU
composites. Never `will-change: all`. Add it only after observing first-frame stutter.

**Motion restraint.** Motion is a budget, not a garnish. High-frequency interactions get instant
feedback or a minimal opacity/background transition at `<=150ms`. Motion is never the only feedback
channel — every animated state change also needs a static cue: color, icon, or label. Honor
`prefers-reduced-motion` by removing the movement while keeping the static cue.

## Typography

**Text wrapping.** `text-wrap: balance` on headings — it only applies to blocks of ~6 lines or
fewer, so it is silently wasted on paragraphs. `text-wrap: pretty` on short-to-medium body text,
descriptions, captions, and list items to prevent orphans. On text of 10+ lines use neither.

**Font smoothing.** `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`
once at the root. macOS renders text heavier than intended by default; other platforms ignore
these properties. Applying it per-element produces inconsistent weight.

**Tabular numbers.** `font-variant-numeric: tabular-nums` on any number that updates — counters,
timers, prices, dashboard metrics, numeric table columns — to stop layout shift as values change.
Not on static numbers, phone numbers, or version strings. In some faces, notably Inter, the digit
`1` widens and re-centers; that is expected.

**Font family.** This pass does not require a specific typeface and must not introduce a paid or
proprietary one. Font smoothing, wrapping, and tabular numbers are rendering details; they do not
override the project's chosen font.

## Icons

**Match stroke to text weight.** On a 24px grid: `1.5px` beside regular (400) text at 14-16px,
`2px` beside medium/semibold (500-600), `2.5px` beside bold (700) or emphasized standalone. One
stroke weight per icon set on a surface; never mix libraries on one surface. Size inline icons at
`1em`-`1.25em`.

**One SVG, recolored per state.** Icons use `currentColor` and take hover, selected, and disabled
states from CSS color and opacity — never from separate assets. Strip hardcoded `fill` and
`stroke` colors on import. Outline is the default variant; fill marks the active state.

**Design at render size.** Test each icon at the smallest size it will render, often 16px. Use the
set's native grid sizes (16, 20, 24) rather than arbitrary fractional scales.

**Accessible names.** Every icon-only control needs one. Mark purely decorative icons hidden from
assistive technology.

## Where this pass applies in a sidebar conversion

| Surface | What to check |
|---|---|
| Nav items | 40x40 minimum hit area; `<=150ms` color-only transition; icon stroke matched to the 500-weight label; `currentColor` icons; active state has a non-color cue |
| Sidebar collapse | CSS transition on `width`, not a keyframe; interruptible mid-toggle |
| Cards | Concentric radius against inner controls; hairline border plus soft shadow, not a hard border faking depth |
| Metrics and tables | `tabular-nums` on every figure that updates |
| Buttons | `scale(0.96)` on press; named transition properties; 40x40 minimum |
| Headings and body | `text-wrap: balance` on headings, `pretty` on descriptions |
| Root | `-webkit-font-smoothing: antialiased` set once |
