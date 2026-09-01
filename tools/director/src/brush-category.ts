/**
 * Which brush categories (`BRUSH_GROUPS` in brush-groups.ts — CANNON, SHIELD,
 * MIXED, SUCK…) are folded away in the palette.
 *
 * The palette used to be a rail of tabs where exactly one category showed at
 * a time, and this module held that one label. It is an accordion now: every
 * category's brushes sit directly under its own button, in the same column,
 * and each one opens and closes on its own. So the stored value is the set of
 * the *closed* ones rather than the single open one — which is also what
 * makes "expanded by default" fall out for free, since a first run has
 * nothing stored and an empty set closes nothing.
 *
 * Kept out of `palette.ts` for the same reason as before: `render()` rebuilds
 * the whole palette from scratch on every brush pick and every wave switch,
 * so a closure-local variable would survive those and not a reload, and
 * "which category was folded" is exactly the small per-author preference this
 * repo already keeps in localStorage (`columns.ts`, `subcols.ts`).
 */

const STORE_KEY = "director-brush-categories-closed";

export function readClosedCategories(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — the palette still works for this load, every category simply
    // opens expanded every time rather than remembering what was folded.
    return new Set();
  }
}

export function writeClosedCategories(closed: ReadonlySet<string>): void {
  try {
    localStorage.setItem(STORE_KEY, Array.from(closed).join(","));
  } catch {
    // See readClosedCategories — nothing to persist to, nothing to do about it.
  }
}
