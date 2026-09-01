/**
 * Whether one brush category (`BRUSH_GROUPS` in brush-groups.ts — CANNON,
 * SHIELD, MIXED, SUCK…) is put away. Pulled out of `palette.ts` rather than
 * kept as a closure-local `Set` because `palette.ts`'s `render()` rebuilds
 * `#brushes` from scratch on every brush pick and every wave switch — state
 * that lived only in the DOM would vanish on the very next render, and state
 * that lived only in a module-local variable would not survive a reload. A
 * category collapses so a long palette on a small screen does not push the
 * map (now stacked below it, see subcols.ts) further down than the categories
 * the author is not using right now.
 *
 * Namespaced separately from both `columns.ts` (`director-column:`) and
 * `subcols.ts` (`director-subcol:`) — a category label never collides with a
 * column or subcol id even if the words happened to match.
 */

const STORE_PREFIX = "director-brush-group:";

export function storageKey(label: string): string {
  return STORE_PREFIX + label;
}

export function isCollapsed(label: string): boolean {
  try {
    return localStorage.getItem(storageKey(label)) === "closed";
  } catch {
    return false;
  }
}

export function setCollapsed(label: string, collapsed: boolean): void {
  try {
    if (collapsed) localStorage.setItem(storageKey(label), "closed");
    else localStorage.removeItem(storageKey(label));
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — collapsing still works for this load, it just does not
    // survive a reload.
  }
}
