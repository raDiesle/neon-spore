import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { beatCount, currentWave, type Store } from "./state.js";

/**
 * The line of arithmetic under the map: how many entries and pods the wave
 * carries, how long it runs, and the note about the seven authored columns.
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

export function bindGridNote(store: Store, cfg: () => SimConfig): GridNote {
  const note = document.getElementById("gridNote");

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
    note.textContent =
      `${wave.entries.length} entries · ${pods} pods · ${beats} beats ≈ ${seconds}s at ` +
      `${cfg().bpm} BPM. Columns are the seven a wave is authored against; the ` +
      `field plays ${cfg().cols} and mapCol remaps them.`;
  };

  return { render: renderNote };
}
