import { decideOpen, forcedClosedFromUrl } from "./columns.js";

/**
 * A finer-grained collapse than `columns.ts`'s whole-section one. BRUSH and
 * MAP now stack in one column (index.html — a wide map used to sit beside the
 * palette, and reaching a brush after scrolling right to the map's far edge
 * meant scrolling all the way back), so each of the two can also close on its
 * own: putting the palette away gives a tall map the room, and putting the
 * map away gives a long brush list the room, without asking for a wider
 * screen either way.
 *
 * Reuses `decideOpen`/`forcedClosedFromUrl` from columns.ts rather than
 * re-deriving the same priority rule — the URL always wins, the human's own
 * stored choice otherwise, open by default. Storage is namespaced separately
 * (`director-subcol:`) so a subcol id never collides with a top-level column
 * id in localStorage even if they happened to match.
 */

const STORE_PREFIX = "director-subcol:";

export function storageKey(id: string): string {
  return STORE_PREFIX + id;
}

function readStored(id: string): boolean | null {
  try {
    const v = localStorage.getItem(storageKey(id));
    if (v === "closed") return false;
    if (v === "open") return true;
    return null;
  } catch {
    return null;
  }
}

function writeStored(id: string, open: boolean): void {
  try {
    localStorage.setItem(storageKey(id), open ? "open" : "closed");
  } catch {
    // Storage can be unavailable (private mode, a headless run with no
    // origin) — collapsing still works for this load, it just does not
    // survive a reload.
  }
}

/**
 * Wires every `[data-subcol-toggle]` button to collapse the `[data-subcol]`
 * ancestor it opens. Call once, after the markup exists.
 */
export function initSubcols(root: ParentNode = document, search: string = location.search): void {
  const forced = forcedClosedFromUrl(search);
  const toggles = Array.from(root.querySelectorAll<HTMLElement>("[data-subcol-toggle]"));
  for (const toggle of toggles) {
    const holder = toggle.closest<HTMLElement>("[data-subcol]");
    const id = holder?.dataset.subcol;
    if (!holder || !id) continue;

    const open = decideOpen(id, forced, readStored(id));
    holder.classList.toggle("collapsed", !open);

    toggle.addEventListener("click", () => {
      const nowOpen = holder.classList.contains("collapsed");
      holder.classList.toggle("collapsed", !nowOpen);
      writeStored(id, nowOpen);
    });
  }
}
