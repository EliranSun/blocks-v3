# Migrate Blocks / Categories / Subcategories to Database + Admin UI

## Context

Today `src/constants.js` is the single source of truth for the taxonomy that drives the entire app:

- `Blocks` — a flat `NAME: "value"` map of 83 block strings.
- `Categories` — 8 categories with `{ name, icon (Lucide component), bgColor, color, subcategories: string[], blocks: string[] }`.
- `CategoryColors` / `CategoryBgColors` — string-keyed lookup maps used by `Block.jsx` and `YearPixelView.jsx`.

These constants are imported by 11 files. Every edit (adding a friend, renaming a block, tweaking a color) requires a code change and redeploy.

This plan migrates the taxonomy into the existing MongoDB-backed API (alongside `/api/logs`), exposes it through a `TaxonomyProvider` so existing views consume it byte-for-byte unchanged, and ships a neobrutalist **Admin** screen behind the nav menu with full CRUD for categories, subcategories, and blocks plus a one-time "Seed from constants" button. Outcome: taxonomy edits happen live in the running app, no redeploys, and logs keep grouping correctly because seed preserves the exact string values logs already reference.

---

## User Decisions Locked In

1. **API**: assume sibling endpoints `/api/categories`, `/api/subcategories`, `/api/blocks` exist on `walak.vercel.app` with the same conventions as `/api/logs` (GET list, POST create, PUT with `{id, ...data}`, DELETE `?id=`). Backend work is out of scope for this plan.
2. **Subcategories**: separate collection with `{ _id, name, categoryId }`.
3. **Icons**: store the Lucide component name as a string (e.g. `"Heart"`); resolve to component at render time via a registry with a safe fallback.
4. **Seeding**: a "Seed from constants" button inside the Admin UI, visible only when all three collections are empty.

---

## A. Data Shapes

All three collections use MongoDB-style `_id`. **Seed must preserve the exact lowercase string values currently in `constants.js`** (e.g. `"wife"`, `"doom scroll"`, `"WhatsApp"`) — logs reference them by string and `Block.jsx` does `item.category?.toLowerCase()` lookups against `CategoryBgColors`.

**Category**

```
{ _id, name, displayKey, icon, bgColor, color, order, createdAt }
```

- `name`: lowercase id used by logs (e.g. `"wife"`).
- `displayKey`: PascalCase label currently used as `Object.keys(Categories)` (e.g. `"Wife"`) — preserves UI labels in `LogDialog.jsx`.
- `icon`: Lucide name string (`"Heart"`).
- `bgColor` / `color`: Tailwind classes (`"bg-violet-600"` / `"text-violet-600"`).

**Subcategory**

```
{ _id, name, categoryId, order, createdAt }
```

- `name`: exact case as today (`"WhatsApp"`, `"call"`).

**Block**

```
{ _id, name, categoryId, order, createdAt }
```

- `name`: lowercase string (`"date"`, `"doom scroll"`) or emoji for Mood (`"😀"`).
- The SCREAMING_SNAKE_CASE keys from the current `Blocks` constant are discarded; only the values matter.

---

## B. Data Layer — One Combined Hook

Create **`src/useTaxonomyData.js`** modeled on `src/useLogsData.js`. Justification for one hook (not three): every view needs the joined shape; one hook avoids three loading-state waterfalls; cross-collection mutations (cascade-delete a category) need one owner.

Exposes:

```
{
  categories, subcategories, blocks,          // raw rows
  categoriesShape,                            // joined legacy-compatible Categories object (see D)
  categoryColors, categoryBgColors,           // derived legacy maps for Block.jsx / YearPixelView.jsx
  isLoading, isEmpty,                         // isEmpty drives the seed banner
  addCategory, editCategory, deleteCategory,  // deleteCategory cascades to subcats + blocks
  addSubcategory, editSubcategory, deleteSubcategory,
  addBlock, editBlock, deleteBlock,
  seedFromConstants,                          // POSTs constants in dependency order
}
```

Reuses the `useToast` error path from `useLogsData.js`. Three parallel `fetch` calls in one `useEffect` via `Promise.all`. Optimistic local updates keyed by `_id`, same pattern as logs.

---

## C. Icon Mapping

Create **`src/iconRegistry.js`**:

- Curated map of ~40 Lucide imports (`Brain`, `Heart`, `Palette`, `Activity`, `Home`, `Sun`, `Users`, `Ban`, `Star`, `Coffee`, `Music`, `Book`, `Camera`, `Smile`, ...).
- `ICON_NAMES = Object.keys(ICON_REGISTRY)` for the picker.
- `getIcon(name)` returns the component or `HelpCircle` if not found — renders never crash on a stale name.

---

## D. Backwards Compatibility — `TaxonomyProvider` yielding the legacy `Categories` shape

Create **`src/TaxonomyContext.jsx`** wrapping `useTaxonomyData`. The provider exposes `categoriesShape`, which is a `useMemo` that joins the three collections into the exact object shape existing views already consume:

```js
categoriesShape[cat.displayKey] = {
  _id, name, icon: getIcon(cat.icon), bgColor, color,
  subcategories: [...subcat names ordered],
  blocks: [...block names ordered],
}
```

This is byte-for-byte compatible with how `LogDialog.jsx`, `CategoryButtons.jsx`, `BlocksDataView.jsx`, `BlocksToolbar.jsx`, `InsightsView.jsx`, `BlockDetailView.jsx`, `CategoryDetailView.jsx`, and `YearPixelView.jsx` use `Categories` today. The 11 consumer files only need an **import swap**:

```diff
- import { Categories } from "./constants";
+ import { useTaxonomy } from "./TaxonomyContext";
  // ...inside the component:
+ const { Categories } = useTaxonomy();
```

Top-level constants like `const categoryArray = Object.values(Categories)` move inside the component as `useMemo`. While loading, `Categories` is `{}` — existing `Object.values(...)` calls return empty arrays harmlessly.

`Block.jsx` and `YearPixelView.jsx` consume `categoryColors` / `categoryBgColors` from the hook instead of importing from `constants`.

---

## E. Admin UI

New page at `page === "admin"`. All components under **`src/admin/`**, all styled with the existing neobrutalist patterns (3px black borders, `shadow-[5px_5px_0_0_#000]`, `font-black uppercase`, active translate). Dialogs reuse the existing `Popover` component.

| New file | Role |
|---|---|
| `src/admin/AdminView.jsx` | Page root. Renders `SeedBanner` when `isEmpty`, otherwise a vertical list of `CategoryAdminCard`s. |
| `src/admin/CategoryAdminCard.jsx` | One card per category: icon, name, color swatch, expand toggle revealing nested subcategory and block lists; pencil → `CategoryEditDialog`; trash → `ConfirmDeleteDialog`; up/down arrows update `order`. |
| `src/admin/SubcategoryAdminList.jsx` | Inline chip list with add input + per-chip edit/delete. |
| `src/admin/BlockAdminList.jsx` | Inline chip grid with edit/delete + "Move" button that opens a category picker to reassign `categoryId`. |
| `src/admin/CategoryEditDialog.jsx` | Popover with name, displayKey, `IconPicker`, `ColorSwatchPicker`. |
| `src/admin/SubcategoryEditDialog.jsx` | Popover with name input. |
| `src/admin/BlockEditDialog.jsx` | Popover with name input + category select (reassignment). |
| `src/admin/IconPicker.jsx` | Grid of all `ICON_NAMES`, current selection highlighted, rendered via `getIcon`. |
| `src/admin/ColorSwatchPicker.jsx` | Preset Tailwind swatches (`bg-violet-600`, `bg-amber-400`, ...). Picking a `bg-` derives the matching `text-` via a parallel preset map. |
| `src/admin/ConfirmDeleteDialog.jsx` | Reusable destructive confirmation with neobrutalist red CTA. |
| `src/admin/SeedBanner.jsx` | Visible only when `isEmpty`. Single "Seed from constants" button. |

**Reordering**: up/down arrow buttons updating `order` (defer drag-and-drop unless requested later).

**Seeding sequence** inside `seedFromConstants`:

1. POST all 8 categories (mapping the live Lucide imports back to their string names via a small inline `component → "Name"` map).
2. Resolve returned `_id`s.
3. POST subcategories and blocks in parallel using the right `categoryId`.

---

## F. Menu Wiring

**`src/NavMenu.jsx`** — append to `NAV_ITEMS`:

```js
{ key: "admin", label: "Admin", icon: Settings }
```

(`Settings` from `lucide-react`.)

**`src/main.jsx`** — wrap `<App />` in `<TaxonomyProvider>` next to `<ToastProvider>`.

**`src/App.jsx`** — add a branch to the `AnimatePresence` block:

```jsx
) : page === "admin" ? (
  <m.div key="admin" {...standardEnter}><AdminView /></m.div>
```

---

## G. File-by-File Changes

### New

- `src/useTaxonomyData.js` — combined CRUD hook + seeding + composed shape.
- `src/TaxonomyContext.jsx` — provider/consumer yielding legacy-shaped `Categories`.
- `src/iconRegistry.js` — Lucide name→component map with safe fallback.
- `src/admin/AdminView.jsx` + 10 sibling files listed in section E.

### Modified

| File | Change |
|---|---|
| `src/main.jsx` | Wrap `<App />` in `<TaxonomyProvider>`. |
| `src/App.jsx` | Add `admin` branch to `AnimatePresence`; render `<AdminView />`. |
| `src/NavMenu.jsx` | Add Admin entry to `NAV_ITEMS`; import `Settings`. |
| `src/constants.js` | Keep `Scopes` and `MonthNotes`. Leave `Blocks` and `Categories` exported as seed source only; add header comment noting that. |
| `src/LogDialog.jsx` | Swap `import { Categories }` for `useTaxonomy()`; move `categoryArray` into `useMemo`. |
| `src/CategoryButtons.jsx` | Same swap; recompute `CategoryItems` inside the component. |
| `src/CategoryDetailView.jsx` | Same swap. |
| `src/BlocksDataView.jsx` | Same swap; move `categoryCount` inside the component. |
| `src/BlocksToolbar.jsx` | Same swap; move `categoryList` inside the component. |
| `src/BlockDetailView.jsx` | Same swap. |
| `src/InsightsView.jsx` | Same swap; replace top-level `Object.values(Categories)` with hook-derived values. |
| `src/YearPixelView.jsx` | Same swap; consume `categoryBgColors` from the hook. |
| `src/Block.jsx` | Replace `CategoryColors` / `CategoryBgColors` imports with `useTaxonomy()`-derived maps inside the `memo`'d body. |
| `src/BlocksList.jsx` | No change (only imports `MonthNotes`). |
| `src/NavigationButtons.jsx` | No change (only imports `Scopes`). |

### Out of scope (noted)

Three serverless routes mirroring `/api/logs` shape: `/api/categories`, `/api/subcategories`, `/api/blocks`.

---

## H. Verification Plan

End-to-end manual test against the running app:

1. **Empty state** — clear the three new collections. Open Admin: seed banner visible. Other views render gracefully with empty taxonomy (no crashes from `Object.values({})`).
2. **Seed** — click "Seed from constants". Verify 8 categories appear in correct order with correct icons/colors; Family and Friends have 4 subcategories each, others 0; block counts per category match (Mood 5, Wife 5, Creative 6, Health 9, Household 9, Family 10, Friends 8, Avoid 4). Banner disappears.
3. **Visual parity** — navigate Blocks / Data / Insights / Year Pixel. Output matches pre-migration screenshots.
4. **Log grouping** — open existing logs (`category: "wife"`, etc.). `CategoryDetailView` and `BlockDetailView` group them correctly (confirms exact string casing was preserved).
5. **Create category** — Admin → "+ Category": name `"test"`, displayKey `"Test"`, icon `Star`, color `bg-emerald-500`. Save. LogDialog category picker shows the new tile.
6. **Add subcategory + block** to "test"; confirm both appear in LogDialog.
7. **Create a log** with category=test, block=new. Reload. Log persists with the right styling.
8. **Edit category** — change color and icon. Every view re-renders without page reload, including the existing log.
9. **Move a block** — move `"code"` from Creative to Test. Refresh. Old location no longer shows it; new one does; LogDialog reflects this.
10. **Delete a subcategory** — delete `"WhatsApp"` from Family. Existing logs with that subcategory still render (string field unaffected); picker no longer offers it.
11. **Delete a category** — delete `"test"`. Confirmation dialog. Cascade removes its subcategories and blocks. Existing logs with `category: "test"` fall back to `bg-neutral-400` (matches existing fallback in `Block.jsx` and `YearPixelView.jsx`).
12. **Unknown icon resilience** — manually set a category's `icon` field to `"Bogus"` in DB. App renders with `HelpCircle` fallback, no crash.
13. **Error states** — disable network. `useToast` surfaces the same "Couldn't load…" error path as `useLogsData`. Admin page does not deadlock.
14. **Lint / build** — `npm run lint` and `npm run build` pass with zero new warnings.

---

## Critical Files

- `src/useTaxonomyData.js` (new) — combined data hook with seeding + composed shape.
- `src/TaxonomyContext.jsx` (new) — provider yielding the legacy-shaped `Categories`.
- `src/iconRegistry.js` (new) — Lucide name→component map with safe fallback.
- `src/admin/AdminView.jsx` (new) — admin page root composing all admin sub-components.
- `src/LogDialog.jsx` (modified) — most complex consumer; biggest risk during the import swap.
- `src/constants.js` (modified) — becomes seed-only.

---

## Progress Checklist

Tick items off as we ship them. Grouped so each block can be completed and verified in isolation.

### 1. Foundation (data + shape)

- [ ] Create `src/iconRegistry.js` with curated Lucide map + `getIcon` fallback to `HelpCircle`.
- [ ] Create `src/useTaxonomyData.js` (GET/POST/PUT/DELETE for categories, subcategories, blocks; `isEmpty`; `seedFromConstants`; cascade delete).
- [ ] Compose `categoriesShape`, `categoryColors`, `categoryBgColors` inside the hook.
- [ ] Create `src/TaxonomyContext.jsx` with `TaxonomyProvider` and `useTaxonomy`.
- [ ] Wrap `<App />` in `<TaxonomyProvider>` in `src/main.jsx`.

### 2. Consumer migration (one file at a time)

- [ ] `src/Block.jsx` — swap `CategoryColors` / `CategoryBgColors` imports for hook-derived maps.
- [ ] `src/LogDialog.jsx` — swap `Categories` import; move `categoryArray` into `useMemo`.
- [ ] `src/CategoryButtons.jsx` — swap import; recompute `CategoryItems` inside the component.
- [ ] `src/CategoryDetailView.jsx` — swap import.
- [ ] `src/BlocksDataView.jsx` — swap import; move `categoryCount` inside component.
- [ ] `src/BlocksToolbar.jsx` — swap import; move `categoryList` inside component.
- [ ] `src/BlockDetailView.jsx` — swap import.
- [ ] `src/InsightsView.jsx` — swap import; relocate top-level `Object.values(Categories)` calls.
- [ ] `src/YearPixelView.jsx` — swap import; consume `categoryBgColors` from hook.
- [ ] Verify Blocks / Data / Insights / Year Pixel views still render identically with the empty-DB path (Categories = {}).

### 3. Admin shell + menu wiring

- [ ] Add `{ key: "admin", label: "Admin", icon: Settings }` to `NAV_ITEMS` in `src/NavMenu.jsx`.
- [ ] Add `admin` branch to `AnimatePresence` in `src/App.jsx`.
- [ ] Create `src/admin/AdminView.jsx` skeleton (header + empty state).
- [ ] Create `src/admin/SeedBanner.jsx` — visible only when `isEmpty`, calls `seedFromConstants`.
- [ ] Add the seed-only header comment to `src/constants.js`.

### 4. Admin CRUD components

- [ ] `src/admin/IconPicker.jsx` — Lucide icon grid using `ICON_NAMES`.
- [ ] `src/admin/ColorSwatchPicker.jsx` — preset Tailwind `bg-`/`text-` pairs.
- [ ] `src/admin/ConfirmDeleteDialog.jsx` — reusable red CTA confirmation.
- [ ] `src/admin/CategoryEditDialog.jsx` — name + displayKey + icon + color.
- [ ] `src/admin/SubcategoryEditDialog.jsx` — name only.
- [ ] `src/admin/BlockEditDialog.jsx` — name + category select (reassignment).
- [ ] `src/admin/CategoryAdminCard.jsx` — per-category card with expand toggle, edit, delete, up/down reorder.
- [ ] `src/admin/SubcategoryAdminList.jsx` — inline chip list with add/edit/delete.
- [ ] `src/admin/BlockAdminList.jsx` — inline chip grid with edit/delete + cross-category "Move".

### 5. Verification (from section H)

- [ ] Empty-state seed banner appears; other views render gracefully.
- [ ] Seed populates 8 categories with correct counts (Mood 5 / Wife 5 / Creative 6 / Health 9 / Household 9 / Family 10 / Friends 8 / Avoid 4; Family + Friends each have 4 subcats).
- [ ] Pre-existing logs still group under the right category and subcategory after seed.
- [ ] Create a new category → appears in LogDialog with chosen icon/color.
- [ ] Add subcategory + block to new category → both visible in LogDialog flow.
- [ ] Edit a category's icon/color → every view re-renders without reload.
- [ ] Move a block across categories → reflected everywhere.
- [ ] Delete a subcategory → existing logs with that string still render.
- [ ] Delete a category → cascade removes subcats + blocks; orphaned logs fall back to `bg-neutral-400`.
- [ ] Unknown icon name renders as `HelpCircle`, no crash.
- [ ] Network-disabled state surfaces the `useToast` error path.
- [ ] `npm run lint` and `npm run build` pass with zero new warnings.
