import { type Store, waveStep } from "./state.js";
import { isTyping } from "./typing.js";

/**
 * **The two arrows over the WAVE column, and the wave they stand either side
 * of**, plus the two keys that are the same step without the mouse.
 *
 * The owner asked for them on 14 September 2026: reading through the waves in
 * order was a press on a row, a trip back to the list, and a press on the next
 * one — with the editor's own column scrolled to wherever it had been left.
 * These open the row before and the row after through the same `onSelect` a row
 * press makes, so the list, the map and the stage follow exactly as they do for
 * a press.
 *
 * Split out of `rail.ts` because that file was at its limit; the seam is the
 * one the panel already has. `rail.ts` is the wave being edited — its list and
 * its fields — and this is *which* wave that is.
 */
export interface WaveSteps {
  render(): void;
}

/** What stands between the two arrows: which wave this is, out of how many.
 * Both numbers as a person counts them, from 1, the way the rail's own rows
 * are numbered. */
export function waveNowText(store: Store): string {
  return `${String(store.index + 1).padStart(2, "0")} / ${store.waves.length}`;
}

export function bindWaveSteps(store: Store, onSelect: () => void): WaveSteps {
  const arrows: [HTMLButtonElement | null, number][] = [
    [document.getElementById("wavePrev") as HTMLButtonElement | null, -1],
    [document.getElementById("waveNext") as HTMLButtonElement | null, 1],
  ];
  const now = document.getElementById("waveNow");

  /** Open the wave a step away, exactly as a press on its row would. */
  const step = (delta: number): void => {
    const to = waveStep(store, delta);
    if (to === null) return;
    store.index = to;
    onSelect();
  };

  for (const [btn, delta] of arrows) btn?.addEventListener("click", () => step(delta));
  // On the window rather than on the bar, and ignored while a field has focus:
  // the same two rules `grid.ts` binds Delete under, for the same reasons — the
  // arrows are replaced by a re-render, and `[` belongs to whoever is typing.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "[" && e.key !== "]") return;
    if (isTyping(document.activeElement)) return;
    step(e.key === "[" ? -1 : 1);
  });

  return {
    /**
     * Each arrow says which wave it opens, by number and name, and is disabled
     * at the end of the list rather than wrapping — a list read in order has a
     * first wave and a last one, and an arrow that came back round would lose
     * the reader's place in it.
     */
    render(): void {
      if (now) now.textContent = waveNowText(store);
      for (const [btn, delta] of arrows) {
        if (!btn) continue;
        const to = waveStep(store, delta);
        btn.disabled = to === null;
        btn.title =
          to === null
            ? ""
            : `${String(to + 1).padStart(2, "0")} ${store.waves[to]?.name || "— unnamed —"}`;
      }
    },
  };
}
