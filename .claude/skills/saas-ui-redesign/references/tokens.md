# Tokens: palette, spacing, type, radius, elevation

Everything here is a fixed, vetted constant. Do **not** generate a palette at runtime and do
**not** fetch anything — this file is the whole source of truth.

## Provenance and licensing

Every value below was copied from an MIT-licensed source. All three permit copying and
redistribution; the values are reproduced here as data, and the sources are credited.

| Source | What was taken | License |
|---|---|---|
| [radix-ui/colors](https://github.com/radix-ui/colors) | The 12-step hex ramps, from the `@radix-ui/colors` package CSS (not the marketing site, which renders via JS) | MIT — Copyright (c) 2021-2022 Modulz, (c) 2022-Present WorkOS |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | The semantic token **names**, including the dedicated `--sidebar-*` set, and the sidebar width constants | MIT — Copyright (c) 2023 shadcn |
| [tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) | The spacing and type scale steps | MIT |

**Never copy from:** Geist (no confirmed open license on its values), Tailwind UI (paid),
Untitled UI (Figma licensing). If you need a value you cannot trace to an MIT source, derive it
from the values here instead of importing it.

## The one hard rule

> Run `scripts/check_contrast.mjs`. Never eyeball contrast.

Ratios are not intuitive. Two of the traps below were found only by running the validator:

- **No Radix slate step below 9 reaches 3:1 on white.** Slate-8 — the step people reach for when
  they want a "strong" border — measures **1.91:1**. It cannot carry a meaningful border.
- **Dark-mode slate-8 passes on the canvas and fails on the card.** `#5a6169` measures 3.01:1 on
  `#111113` but **2.81:1** on `#18191b`. The surface argument matters.

## Accessibility targets

| Requirement | Ratio | WCAG 2.2 | Level |
|---|---|---|---|
| Body text | 4.5:1 | SC 1.4.3 Contrast (Minimum) | AA |
| Large text (>=24px, or >=18.66px bold) | 3:1 | SC 1.4.3 Contrast (Minimum) | AA |
| UI components, meaningful borders, focus rings | 3:1 | SC 1.4.11 Non-text Contrast | AA |
| Focus indicator not hidden behind sticky UI | — | SC 2.4.11 Focus Not Obscured (Minimum) | **AA** |
| Focus indicator size and contrast | — | SC 2.4.13 Focus Appearance | **AAA** |

Get the last two tiers right in anything you write. 2.4.11 is AA and applies directly to a
sticky sidebar or top bar that can cover a focused element. 2.4.13 is AAA — meet it if you can,
but do not describe it as required for AA compliance.

## Radix step -> role convention

The 12 steps are ordered by function, not by taste. Assign a step by the job, not by the look:

| Steps | Role |
|---|---|
| 1-2 | App background, subtle page canvas |
| 3-5 | Component surfaces: normal, hover, active/pressed |
| 6-8 | Borders: subtle, standard, strong |
| 9-10 | Solid fills: normal, hover |
| 11 | Low-contrast text (passes 4.5:1 on steps 1-2) |
| 12 | High-contrast text |

Two caveats the convention hides, both measured:

- Steps 6-8 are **decorative** separators in light mode. A border that conveys meaning — an input
  outline, a selected state, a focus ring — needs step 9 or darker.
- Step 9 solids do not reliably take white text. White on blue-9 is **3.26:1** (large text only);
  white on amber-9 is **1.58:1** (fails outright). Use step 11 as the fill when the button has
  body-size text, or put step-12 ink on the step-9 fill.

## The ramps

Copied verbatim from `@radix-ui/colors@3.0.0`.

```css
:root {
  /* Neutral — Radix Slate (light) */
  --slate-1:  #fcfcfd;  --slate-2:  #f9f9fb;  --slate-3:  #f0f0f3;  --slate-4:  #e8e8ec;
  --slate-5:  #e0e1e6;  --slate-6:  #d9d9e0;  --slate-7:  #cdced6;  --slate-8:  #b9bbc6;
  --slate-9:  #8b8d98;  --slate-10: #80838d;  --slate-11: #60646c;  --slate-12: #1c2024;

  /* Accent — Radix Blue (light) */
  --blue-1:   #fbfdff;  --blue-2:   #f4faff;  --blue-3:   #e6f4fe;  --blue-4:   #d5efff;
  --blue-5:   #c2e5ff;  --blue-6:   #acd8fc;  --blue-7:   #8ec8f6;  --blue-8:   #5eb1ef;
  --blue-9:   #0090ff;  --blue-10:  #0588f0;  --blue-11:  #0d74ce;  --blue-12:  #113264;

  /* Status — Radix Green / Amber / Red (light) */
  --green-1:  #fbfefc;  --green-2:  #f4fbf6;  --green-3:  #e6f6eb;  --green-4:  #d6f1df;
  --green-5:  #c4e8d1;  --green-6:  #adddc0;  --green-7:  #8eceaa;  --green-8:  #5bb98b;
  --green-9:  #30a46c;  --green-10: #2b9a66;  --green-11: #218358;  --green-12: #193b2d;

  --amber-1:  #fefdfb;  --amber-2:  #fefbe9;  --amber-3:  #fff7c2;  --amber-4:  #ffee9c;
  --amber-5:  #fbe577;  --amber-6:  #f3d673;  --amber-7:  #e9c162;  --amber-8:  #e2a336;
  --amber-9:  #ffc53d;  --amber-10: #ffba18;  --amber-11: #ab6400;  --amber-12: #4f3422;

  --red-1:    #fffcfc;  --red-2:    #fff7f7;  --red-3:    #feebec;  --red-4:    #ffdbdc;
  --red-5:    #ffcdce;  --red-6:    #fdbdbe;  --red-7:    #f4a9aa;  --red-8:    #eb8e90;
  --red-9:    #e5484d;  --red-10:   #dc3e42;  --red-11:   #ce2c31;  --red-12:   #641723;
}

.dark {
  --slate-1:  #111113;  --slate-2:  #18191b;  --slate-3:  #212225;  --slate-4:  #272a2d;
  --slate-5:  #2e3135;  --slate-6:  #363a3f;  --slate-7:  #43484e;  --slate-8:  #5a6169;
  --slate-9:  #696e77;  --slate-10: #777b84;  --slate-11: #b0b4ba;  --slate-12: #edeef0;

  --blue-1:   #0d1520;  --blue-2:   #111927;  --blue-3:   #0d2847;  --blue-4:   #003362;
  --blue-5:   #004074;  --blue-6:   #104d87;  --blue-7:   #205d9e;  --blue-8:   #2870bd;
  --blue-9:   #0090ff;  --blue-10:  #3b9eff;  --blue-11:  #70b8ff;  --blue-12:  #c2e6ff;

  --green-1:  #0e1512;  --green-2:  #121b17;  --green-3:  #132d21;  --green-4:  #113b29;
  --green-5:  #174933;  --green-6:  #20573e;  --green-7:  #28684a;  --green-8:  #2f7c57;
  --green-9:  #30a46c;  --green-10: #33b074;  --green-11: #3dd68c;  --green-12: #b1f1cb;

  --amber-1:  #16120c;  --amber-2:  #1d180f;  --amber-3:  #302008;  --amber-4:  #3f2700;
  --amber-5:  #4d3000;  --amber-6:  #5c3d05;  --amber-7:  #714f19;  --amber-8:  #8f6424;
  --amber-9:  #ffc53d;  --amber-10: #ffd60a;  --amber-11: #ffca16;  --amber-12: #ffe7b3;

  --red-1:    #191111;  --red-2:    #201314;  --red-3:    #3b1219;  --red-4:    #500f1c;
  --red-5:    #611623;  --red-6:    #72232d;  --red-7:    #8c333a;  --red-8:    #b54548;
  --red-9:    #e5484d;  --red-10:   #ec5d5e;  --red-11:   #ff9592;  --red-12:   #ffd1d9;
}
```

## Semantic layer

Role names from shadcn/ui, values from the ramps above. Application code references only these
names, never a raw step and never a raw hex.

```css
:root {
  --background:             var(--slate-2);   /* page canvas */
  --foreground:             var(--slate-12);
  --card:                   #ffffff;          /* surfaces lifted off the canvas */
  --card-foreground:        var(--slate-12);
  --popover:                #ffffff;
  --popover-foreground:     var(--slate-12);
  --muted:                  var(--slate-3);
  --muted-foreground:       var(--slate-11);
  --accent:                 var(--slate-4);   /* hover fill */
  --accent-foreground:      var(--slate-12);
  --primary:                var(--blue-11);   /* solid fill under white body text */
  --primary-foreground:     #ffffff;
  --destructive:            var(--red-11);
  --destructive-foreground: #ffffff;
  --border:                 var(--slate-6);   /* decorative hairline */
  --border-strong:          var(--slate-9);   /* meaningful border, clears 3:1 */
  --input:                  var(--slate-9);
  --ring:                   var(--blue-9);    /* focus ring, clears 3:1 */

  --sidebar:                      #ffffff;
  --sidebar-foreground:           var(--slate-11);
  --sidebar-primary:              var(--blue-11);
  --sidebar-primary-foreground:   #ffffff;
  --sidebar-accent:               var(--slate-4);   /* active nav item fill */
  --sidebar-accent-foreground:    var(--slate-12);
  --sidebar-border:               var(--slate-6);
  --sidebar-ring:                 var(--blue-9);
}

.dark {
  --background:             var(--slate-1);
  --card:                   var(--slate-2);
  --popover:                var(--slate-2);
  --primary:                var(--blue-11);
  --primary-foreground:     var(--slate-1);
  --destructive:            var(--red-11);
  --destructive-foreground: var(--slate-1);
  --border-strong:          var(--slate-9);   /* slate-8 fails on --card in dark; measured 2.81:1 */
  --input:                  var(--slate-9);
  --sidebar:                var(--slate-2);
  /* the rest inherit correctly because the ramps were remapped above */
}
```

`--primary` deliberately uses step 11 rather than the step-9 "solid". Step 9 is the more
saturated brand blue, but white body text on it measures 3.26:1 and fails AA. Step 9 stays in
service as `--ring`, where the 3:1 non-text threshold applies and it passes.

## Verified contrast

Actual output of `scripts/check_contrast.mjs` against the token set above. Reproduce it any time.

```
### LIGHT — on --card / --sidebar (#ffffff)
[PASS] foreground          #1c2024   16.39:1  body text, needs 4.5:1 (SC 1.4.3)
[PASS] muted-foreground    #60646c    5.94:1  body text, needs 4.5:1 (SC 1.4.3)
[PASS] primary             #0d74ce    4.77:1  body text, needs 4.5:1 (SC 1.4.3)
[PASS] sidebar-foreground  #60646c    5.94:1  body text, needs 4.5:1 (SC 1.4.3)
[PASS] destructive         #ce2c31    5.21:1  body text, needs 4.5:1 (SC 1.4.3)
[PASS] border-strong       #8b8d98    3.30:1  UI component / border, needs 3.0:1 (SC 1.4.11)
[PASS] ring                #0090ff    3.26:1  UI component / border, needs 3.0:1 (SC 1.4.11)
[PASS] border              #d9d9e0    1.40:1  decorative, no minimum
### LIGHT — on --background canvas (#f9f9fb)
[PASS] foreground          #1c2024   15.58:1   [PASS] muted-foreground  #60646c   5.65:1
[PASS] primary             #0d74ce    4.53:1   [PASS] border-strong     #8b8d98   3.14:1 (ui)
### LIGHT — on --accent / --sidebar-accent (#e8e8ec)
[PASS] accent-foreground   #1c2024   13.41:1   [PASS] muted-foreground  #60646c   4.86:1
### LIGHT — on --primary (#0d74ce) / --destructive (#ce2c31)
[PASS] primary-foreground  #ffffff    4.77:1   [PASS] destructive-foreground  #ffffff  5.21:1

### DARK — on --card / --sidebar (#18191b)
[PASS] foreground          #edeef0   15.15:1   [PASS] muted-foreground  #b0b4ba   8.45:1
[PASS] primary             #70b8ff    8.37:1   [PASS] destructive       #ff9592   8.35:1
[PASS] border-strong       #696e77    3.43:1 (ui)   [PASS] ring          #0090ff   5.39:1 (ui)
[PASS] border              #363a3f    1.54:1 (decorative)
### DARK — on --background canvas (#111113)
[PASS] foreground          #edeef0   16.25:1   [PASS] muted-foreground  #b0b4ba   9.06:1
[PASS] primary             #70b8ff    8.97:1   [PASS] border-strong     #696e77   3.68:1 (ui)
### DARK — on --accent / --sidebar-accent (#272a2d)
[PASS] accent-foreground   #edeef0   12.43:1   [PASS] muted-foreground  #b0b4ba   6.93:1
### DARK — on --primary (#70b8ff) / --destructive (#ff9592)
[PASS] primary-foreground  #111113    8.97:1   [PASS] destructive-foreground  #111113  8.95:1
```

## Status chips

A tinted chip needs step-12 ink, not step-11. Measured on light step-3 backgrounds, step 11
lands at 4.21-4.54:1 — three of the four common hues miss 4.5:1. Step 12 lands at 10.5-11.3:1.

```css
.badge-success { background: var(--green-3); color: var(--green-12); border: 1px solid var(--green-6); }
.badge-warning { background: var(--amber-3); color: var(--amber-12); border: 1px solid var(--amber-6); }
.badge-danger  { background: var(--red-3);   color: var(--red-12);   border: 1px solid var(--red-6); }
.badge-info    { background: var(--blue-3);  color: var(--blue-12);  border: 1px solid var(--blue-6); }
```

Never encode status by color alone (WCAG SC 1.4.1). Each chip carries a text label; add an icon
if the label is abbreviated.

## Spacing scale — 4px base

**4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.** Tailwind's default steps `1 2 3 4 6 8 12 16`. Refactoring
UI's rule applies: pick from the scale, never invent an in-between value.

```css
:root {
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;
}
```

If the app currently uses rem-based ad-hoc values (`0.875rem`, `1.25rem`, `0.313rem`), snap each
to the nearest scale step during Phase 1. Snapping is the point — preserving them defeats the scale.

## Type scale

**12 / 14 / 16 / 18 / 20 / 24 / 30 / 36px.** Tailwind's `text-xs` through `text-4xl`. Dense
dashboard body text is **14px**; 16px is the default for reading-length prose.

```css
:root {
  --text-xs: 12px;  --text-sm: 14px;  --text-base: 16px; --text-lg: 18px;
  --text-xl: 20px;  --text-2xl: 24px; --text-3xl: 30px;  --text-4xl: 36px;
}
```

Three weights at most: 400 body, 500 or 600 emphasis, 700 headings. Use size and color for
hierarchy before reaching for another weight.

## Radius scale

```css
:root { --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-xl: 16px; }
```

8px is shadcn's `rounded-md` under its default `--radius: 0.625rem` — verified from
`registry/new-york-v4`, where `--radius-md: calc(var(--radius) * 0.8)`. Radii must be concentric
when nested: see the concentric rule in `polish.md`.

## Elevation

Borders carry structure; large, soft, low-opacity shadows carry elevation. A small dark shadow
reads as a smudge — this is Refactoring UI's core shadow rule and it is not negotiable.

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06);
  --shadow-md: 0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.08);
  --shadow-lg: 0 4px 8px -2px rgb(0 0 0 / 0.05), 0 12px 32px -4px rgb(0 0 0 / 0.12);
}
```

Cards get `--shadow-sm` plus a `--border` hairline. Dropdowns and popovers get `--shadow-md`.
Modals get `--shadow-lg`. Nothing else gets a shadow.

## Mapping existing literals onto tokens

Phase 1 is a mapping exercise, not a rebrand. The redesign is structural; the app should keep
looking like itself.

1. Extract the app's existing literals and sort by frequency:
   `rg -o -e '#[0-9a-fA-F]{3,8}\b' -e 'rgba?\([^)]*\)' <src> | sort | uniq -c | sort -rn`
2. For each literal, name the **role** it plays (canvas, card, hairline, muted label, danger text)
   rather than the color it is.
3. Bind that role to the semantic token whose measured contrast fits, and replace the literal
   with `var(--token)`.
4. Where the app's existing hue is a deliberate brand color, keep the hue and remap only the
   neutral ramp. Substitute the brand hex into `--primary`, then re-run the validator against it —
   a brand color that fails 4.5:1 under white text needs a darkened variant for text use, not a
   waiver.
5. Literals that map to nothing are usually one-off mistakes. List them for the user; do not
   silently invent a token for each.

Do not leave a literal and a token expressing the same role in the same file. That is the state
this phase exists to end.
