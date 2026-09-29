import { readRemembered, writeRemembered } from "./remembered.js";

/**
 * THE WAVE THIS DEVICE LAST OPENED, AND THE LIST OPENING ON IT.
 *
 * The owner, 29 September 2026: *"when I am in director or test mode, I want
 * to scroll to the wave which I played previously on this device and
 * highlight it."* The list is thirty-odd rows, the open wave was often past
 * the fold, and a bare address — a bookmark, the phone's home screen — opened
 * on wave one.
 *
 * So two halves. **Which wave**: the URL's `?wave=` still wins, because a link
 * someone sent names a place (`session.ts`); a bare address falls back to the
 * wave last opened here, kept with the other per-author view state
 * (`remembered.ts`). **Where the list is**: whenever `#waveList` comes into
 * view — the first layout, a phone switching to WAVES, a collapsed column
 * opened again — the open row is brought to the middle of its column and
 * pulses once, so the eye lands on it rather than hunting for the gold edge.
 * Only then: a list that is already on screen is somebody reading it, and
 * scrolling it under them for a filter or a rename would be rude.
 */

const KEY = "wave";

/** How long a row counts as just arrived at — the pulse's own length in
 * `director-columns.css`, so a re-render during it keeps the mark. */
const ARRIVED_MS = 1600;

/** The wave last opened on this device, or `null` for none (or no storage). */
export function rememberedWave(): number | null {
  const raw = readRemembered(KEY);
  return raw !== null && /^\d+$/.test(raw) ? Number(raw) : null;
}

export function rememberWave(index: number): void {
  writeRemembered(KEY, String(index));
}

export interface RailArrival {
  /** Puts the pulse back on the open row after the list is redrawn. */
  mark(): void;
}

export function bindRailArrival(list: HTMLElement | null): RailArrival {
  let arrivedAt = Number.NEGATIVE_INFINITY;
  let shown = false;

  // Walked rather than queried, so `test/fake-dom.ts` answers it too.
  const openRow = (): HTMLElement | null =>
    (Array.from(list?.children ?? []) as HTMLElement[]).find((row) =>
      row.classList.contains("on"),
    ) ?? null;

  const mark = (): void => {
    openRow()?.classList.toggle("arrived", performance.now() - arrivedAt < ARRIVED_MS);
  };

  const arrive = (): void => {
    const row = openRow();
    const box = list?.closest("section");
    if (!row || !box) return;
    const offset = row.getBoundingClientRect().top - box.getBoundingClientRect().top;
    box.scrollTop += offset - (box.clientHeight - row.offsetHeight) / 2;
    arrivedAt = performance.now();
    mark();
  };

  if (list && typeof ResizeObserver !== "undefined") {
    // A list with no height is a list nobody can see; the change to having
    // one is the list coming into view.
    new ResizeObserver(() => {
      const now = list.offsetHeight > 0;
      if (now && !shown) arrive();
      shown = now;
    }).observe(list);
  }

  return { mark };
}
