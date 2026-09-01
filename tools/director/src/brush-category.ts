/**
 * Which brush category (`BRUSH_GROUPS` in brush-groups.ts — CANNON, SHIELD,
 * MIXED, SUCK…) the palette's option list is currently showing. Pulled out
 * of `palette.ts` rather than kept as a closure-local variable because
 * `palette.ts`'s `render()` rebuilds `#brushCategories`/`#brushes` from
 * scratch on every brush pick and every wave switch — a plain variable would
 * survive those (it is captured by the closure), but not a reload, and
 * "which tab was open" is exactly the kind of small per-author preference
 * this repo already keeps in localStorage (`columns.ts`, `subcols.ts`).
 *
 * One key, not one per category (contrast `columns.ts`'s per-id
 * `director-column:<id>`): only one category is ever active, so the value
 * itself is the active label rather than a flag beside each one.
 */

const STORE_KEY = "director-brush-category";

export function readActiveCategory(): string | null {
  try {
    return localStorage.getItem(STORE_KEY);
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — the palette still works for this load, it just falls back
    // to the first category every time rather than remembering the last one.
    return null;
  }
}

export function writeActiveCategory(label: string): void {
  try {
    localStorage.setItem(STORE_KEY, label);
  } catch {
    // See readActiveCategory — nothing to persist to, nothing to do about it.
  }
}
