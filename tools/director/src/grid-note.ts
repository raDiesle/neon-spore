import { canTakeEveryTile, onEveryTile, waveCols } from "@neon-spore/content";
import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import type { Selection } from "./selection.js";
import { beatCount, currentWave, type Store } from "./state.js";

/**
 * The line of arithmetic under the map: how many entries and pods the wave
 * carries, how long it runs, and how many columns it is authored on — with
 * the button that puts a seven-column wave on every tile.
 *
 * It was `grid-pods.ts`, and the pods were the half of it — every one on the
 * wave had a line of its own under the grid with its row, its route and its
 * speed on the end. Those three are per-cell configuration and they are in the
 * panel *above* the map now, beside every other per-cell field
 * (`cell-config-pod.ts`), because the owner asked for one place to configure a
 * thing and that place is where the thing is pointed at. What is left is what
 * was never about a cell at all: one sentence about the whole wave.
 *
 * The glyph table went with the list. It was the fallback for a pod whose
 * picture the canvas refused, and the map's own cells fall back to `podGlyph`
 * in `grid-cell-art.ts` — which is now the only copy of it.
 */
export interface GridNote {
  render(): void;
}

export function bindGridNote(
  store: Store,
  cfg: () => SimConfig,
  selection: Selection,
  onEdit: () => void,
): GridNote {
  const note = document.getElementById("gridNote");

  /** Every column the wave holds moved to the tile it already played on, so
   * nothing about the run changes and the four tiles between are free. */
  const everyTile = (): void => {
    const wave = currentWave(store);
    if (!wave) return;
    store.waves[store.index] = onEveryTile(wave, cfg().cols);
    // The selected cell was a column on the old count; on the new one it is a
    // different tile, and pointing at it would be pointing somewhere else.
    selection.set(null);
    store.dirty = true;
    onEdit();
  };

  const renderNote = (): void => {
    if (!note) return;
    const wave = currentWave(store);
    if (!wave) {
      note.textContent = "";
      return;
    }
    const beats = beatCount(wave);
    const seconds = (beats * beatSeconds(cfg())).toFixed(1);
    const pods = wave.pods?.length ?? 0;
    const cols = waveCols(wave);
    const field = cfg().cols;
    note.textContent =
      `${wave.entries.length} entries · ${pods} pods · ${beats} beats ≈ ${seconds}s at ` +
      `${cfg().bpm} BPM. ` +
      (cols === field
        ? `Every one of the field's ${field} tiles.`
        : `${cols} columns, which land on ${cols} of the field's ${field} tiles. `);
    if (cols === field || !canTakeEveryTile(wave)) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "everyTile";
    button.textContent = `ON EVERY TILE (${field})`;
    button.title = "Move this wave onto every tile of the field. It plays exactly as it did.";
    button.addEventListener("click", everyTile);
    note.appendChild(button);
  };

  return { render: renderNote };
}
