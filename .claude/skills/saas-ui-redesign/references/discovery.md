# Discovery: survey an unknown Vue app before touching it

Never assume file layout. Every heuristic here exists because the obvious assumption is wrong in
a real codebase often enough to matter.

Run every sweep. Report the findings to the user **before** editing anything. A sweep that finds
nothing is still a result worth stating — it tells the user which class of breakage they do not
have to worry about.

## Step 1 — Locate the three anchors

**The router.** It is frequently *not* in `src/router/`.

```bash
rg -l 'createRouter|createWebHistory|vue-router' --glob '!node_modules'
rg -n 'path:\s*[\x27"]' --glob '!node_modules'
```

If `createRouter` sits inline in `main.js` or `main.ts`, the route array is a local const with no
export. Note that now: nav generation in Phase 2 will need it exported, and that export is an
edit to the app's entry point.

Record every `path -> component` pair, plus whether routes are lazy (`() => import(...)`), named,
or nested. Nested routes may already imply a layout component.

**The shell.** The component that renders `<router-view />` alongside persistent chrome.

```bash
rg -n 'router-view|<RouterView' --glob '!node_modules'
```

Usually `App.vue`. Find the CSS rule that establishes its main axis — a
`flex-direction: column`, a `grid-template-rows`, or an implicit block stack. Quote it with its
line number; Phase 2 rewrites exactly that rule.

**Global styles.** Where do unscoped rules live?

```bash
rg -n '<style(?![^>]*scoped)' --glob '*.vue' --glob '!node_modules' -P
fd -e css -e scss --exclude node_modules
```

A single unscoped `<style>` block inside `App.vue` is common and is a legitimate place to put
`:root`. Say where you intend to put the token block and why.

## Step 2 — The gotcha sweep

### 2.1 Offsets hardcoded to the current header height

Find the header's height first, then grep for that literal everywhere else.

```bash
rg -n 'position:\s*(sticky|fixed)' -A 3 --glob '!node_modules'
rg -n '(top|padding-top|margin-top):\s*[0-9]+px|calc\(100vh\s*-' --glob '!node_modules'
```

A `top: 70px` on a sticky filter bar is a silent coupling to a 70px header. Nothing declares the
relationship, so changing the header leaves the filter bar floating in the wrong place. List each
one with the height it is coupled to. Also flag sticky elements whose offset is legitimately `0`
because they stick to a scroll container rather than the header — those must **not** be re-anchored.

### 2.2 Multiple independent centering contexts

```bash
rg -n -B 2 -A 2 'margin:\s*0\s+auto' --glob '!node_modules'
```

Count the distinct `max-width` + `margin: 0 auto` pairs. Three separate wrappers each holding the
same max-width is the usual shape: the header, the content area, and a filter bar. They exist
because each is full-bleed under a full-width header. After the conversion they are redundant and
will fight the grid column. Report the count and the values; consolidation happens in Phase 2.

### 2.3 Scoped blocks that redefine global classes

**This is the sweep most likely to be skipped and most likely to cause visible breakage.**
Restyling a global `.card` leaves every view that shadows `.card` in its own `<style scoped>`
looking like the old design.

```bash
# 1. list global class names
rg -o -N '^\s*\.([a-zA-Z][\w-]*)' path/to/App.vue | sort -u
# 2. for each, find scoped redefinitions elsewhere
rg -n '^\s*\.card\b|^\s*\.badge\b|^\s*\.page-header\b' --glob '*.vue' --glob '!node_modules'
```

For every hit, record the class, the global value, and the differing scoped value. Distinguish
three cases, because they need different treatment in Phase 4:

- **Shadow with different values** — a genuine conflict. Reconcile to one definition.
- **Shadow with identical values** — dead code. Delete the scoped copy.
- **Parallel variant** (`.stats-grid-finance` beside `.stats-grid`) — not a shadow. Leave it, or
  promote it to a modifier class.

Also watch for a class declared **twice inside the same scoped block** — a merge artifact where
the second declaration silently wins.

### 2.4 Mixed-language nav labels

```bash
rg -n 'router-link|<RouterLink' -A 2 --glob '!node_modules'
rg -n 'nav\.' --glob '*locale*' --glob '*i18n*' --glob '!node_modules'
```

One hardcoded English string among translated siblings means the locale files are missing a key.
Diff the nav labels against every locale file, not just the default one. Adding the nav is the
moment this becomes visible, so fix it in Phase 2 rather than carrying it forward.

### 2.5 Orphaned views

```bash
fd -e vue . path/to/views
# then, for each file, check it is imported somewhere
rg -n 'Backlog' --glob '!node_modules'
```

A view with no route is not a route to convert, and it must not appear in the generated nav.
Report it and ask whether it is dead code or an unrouted work in progress — do not delete it, and
do not add a route for it.

While here, check the reverse: components referenced in a template but never imported or present
on disk. Vue renders those as nothing, so they are invisible until someone looks.

### 2.6 Absent shared primitives

Count duplicated implementations before adding another one.

```bash
rg -l 'modal-overlay|role="dialog"' --glob '*.vue' --glob '!node_modules'
rg -c '\.btn|\.button|<button' --glob '*.vue' --glob '!node_modules'
```

Six modals that each reimplement overlay, panel, header, and close button mean six places to
restyle. Report the count. **Extracting a shared primitive is out of scope for this skill** —
propose it as follow-up work and let the user decide. What is in scope is making sure the token
layer reaches all six copies.

### 2.7 Size the token work

```bash
rg -o --no-filename -e '#[0-9a-fA-F]{3,8}\b' -e 'rgba?\(' -e 'hsla?\(' <src> | wc -l
rg -l -e '#[0-9a-fA-F]{3,8}\b' -e 'rgba?\(' -e 'hsla?\(' <src> | wc -l
rg -c -e '--[a-zA-Z0-9-]+\s*:' -e 'var\(--' <src>
```

Several hundred literals across a dozen-plus files is normal and is the honest scope of Phase 1.
If the third command returns nothing, the app has **zero** custom properties and the token layer
is net-new — which means the tokens must be derived from the app's existing de-facto palette, not
imposed on top of it. Get the frequency ranking too; it tells you which literals are the real
palette and which are one-offs:

```bash
rg -o --no-filename -e '#[0-9a-fA-F]{3,8}\b' <src> | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn | head -30
```

## Step 3 — Report before editing

Give the user a survey in this shape, then stop for confirmation:

```
Router:        <file>, <n> routes (<inline | dedicated module>), lazy: <yes/no>
Shell:         <file>, axis rule at <file:line>
Global styles: <where>, custom properties: <n>

Header-coupled offsets   <n>   <file:line — declaration, coupled to Npx>
Centering contexts       <n>   <file:line — max-width value>
Scoped global overrides  <n>   <file: classes, conflict | dead | variant>
Untranslated nav labels  <n>   <which, and which locale files lack the key>
Orphaned views           <n>   <file>
Duplicated primitives    <n>   <n modals, n ad-hoc buttons>
Color literals           <n> across <n> files
Existing tokens          <n>

Proposed token location: <file>
Route chosen for the Phase 3 checkpoint: <route> — <why it is representative>
Out of scope: <e.g. extracting a shared Modal primitive; deleting the orphaned view>
```

Pick the checkpoint route now and say why. The right choice is the route that exercises the most
shared surfaces — cards, tables, badges, filters, charts — not the simplest one. Converting the
simplest route proves nothing at the checkpoint.
