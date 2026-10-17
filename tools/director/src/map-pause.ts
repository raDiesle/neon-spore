import type { StagePanel } from "./stage-panel.js";

/**
 * **Touching the map editor pauses the wave.** Any press in the MAP or BRUSH
 * column — a cell picked, a stroke started with a brush, a brush chosen, a
 * row opened or taken out, a field in the cell's panel — stops the field
 * where it is, so nothing is edited under a run that goes on without the
 * author (the owner, 11 October 2026).
 *
 * Heard on `pointerdown` in the capture phase, so it is the first thing the
 * press does and a stroke's first cell is painted on a field already held.
 * The ⏸/▶ and ↺ over the map (`.map-transport`) are left out: they are how a
 * run is started *from* here, and pausing under them would turn ⏸ into ▶.
 */
export function bindMapPause(stage: Pick<StagePanel, "pause">, doc: Document = document): void {
  for (const section of doc.querySelectorAll("section.map-col, section.brush-col")) {
    section.addEventListener(
      "pointerdown",
      (e) => {
        const target = e.target as Element | null;
        if (target?.closest(".map-transport")) return;
        stage.pause();
      },
      true,
    );
  }
}
