/**
 * A column's dragged width, in pixels.
 *
 * Split out of both `columns.ts` (which builds `main`'s
 * `grid-template-columns` and so has to know about an override) and
 * `column-resize.ts` (which writes one on every pointer move) so that neither
 * has to import the other — the drag handle is layered on top of the collapse
 * mechanism, not tangled into it.
 *
 * The stored value is a plain number of CSS pixels rather than a track
 * expression: a drag is the author saying "this wide", and turning that back
 * into `minmax(...)` would let the grid re-solve it into something other than
 * what they let go of.
 */

const STORE_PREFIX = "director-column-width:";

/** Exported so a test can check the key without duplicating the prefix. */
export function widthKey(id: string): string {
  return STORE_PREFIX + id;
}

/** Pure: what a stored string means. Anything unusable reads as "no override". */
export function parseWidth(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return clampWidth(n);
}

/** The range a drag may land in — narrow enough to be a strip, wide enough
 * for the map at its widest, and never zero, which would leave a column with
 * no edge left to grab. */
export const MIN_WIDTH = 140;
const MAX_WIDTH = 1600;

export function clampWidth(px: number): number {
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(px)));
}

export function readWidth(id: string): number | null {
  try {
    return parseWidth(localStorage.getItem(widthKey(id)));
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — dragging still works for this load, it just does not survive
    // a reload.
    return null;
  }
}

export function writeWidth(id: string, px: number | null): void {
  try {
    if (px === null) localStorage.removeItem(widthKey(id));
    else localStorage.setItem(widthKey(id), String(clampWidth(px)));
  } catch {
    // See readWidth — nothing to persist to, nothing to do about it.
  }
}
