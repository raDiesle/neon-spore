/**
 * The last way the author looked at a list, kept across a reload: what the
 * wave filter says, which of its marks are pressed, which status the sounds
 * page is showing.
 *
 * The owner asked for it on 25 September 2026 — *it should remember my
 * previous selections of e.g. wave list filters* — which reverses what
 * `rail-filter.ts` had said about a filter being a way of looking for a
 * minute. It is still not a *setting* in `session.ts`'s sense: nothing here
 * changes what a wave is or what would ship, only which rows are on screen,
 * so it sits with the other per-author view state already in localStorage
 * (`columns.ts`, `brush-category.ts`) and not in the URL.
 *
 * One pair of calls, so every list that joins in gets the same fallback:
 * storage can be missing (private mode, a headless run with no origin), and
 * then a filter simply starts empty each load, the way it always did.
 */

const PREFIX = "director-remembered-";

/** What was last stored under `key`, or `null` for nothing (or no storage). */
export function readRemembered(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

/** Stores `value` under `key`; an empty string or `null` forgets it, so a
 * cleared filter leaves nothing behind. */
export function writeRemembered(key: string, value: string | null): void {
  try {
    if (value) localStorage.setItem(PREFIX + key, value);
    else localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to persist to — the filter still works for this load.
  }
}
