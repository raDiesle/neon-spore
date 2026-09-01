import type { PodEntry, SimConfig } from "@neon-spore/sim";
import { type Brush, beatCount, currentWave, podBrushOf, type Store } from "./state.js";

/**
 * The two things under the map that are about the wave rather than about one
 * cell: the list of pods, and the line of arithmetic describing the wave.
 *
 * Split out of `grid.ts` when the held press and the keyboard removal pushed
 * that file over the line limit. The division is honest rather than arbitrary —
 * `grid.ts` is now only the cells and the gestures on them, and neither of
 * these draws a cell or answers a click on one.
 */

export interface GridPods {
  render(): void;
}

export function bindGridPods(store: Store, cfg: () => SimConfig, onEdit: () => void): GridPods {
  const podList = document.getElementById("podList");
  const note = document.getElementById("gridNote");

  const podRow = (pod: PodEntry): HTMLElement => {
    const row = document.createElement("div");
    row.className = "pod-row";
    const where = document.createElement("span");
    where.textContent = `${podGlyph(podBrushOf(pod))} beat ${pod.beat} · col ${pod.col} · row`;

    // The row is the one pod coordinate the grid cannot show: the grid's
    // vertical axis is time, and a pod's row is where in the field it hangs.
    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = String(cfg().rows - 2);
    input.value = String(pod.row);
    input.addEventListener("change", () => {
      const next = Number(input.value);
      if (!Number.isInteger(next) || next < 1 || next > cfg().rows - 2) {
        input.value = String(pod.row);
        return;
      }
      pod.row = next;
      store.dirty = true;
      onEdit();
    });

    row.append(where, input);
    return row;
  };

  const renderPods = (): void => {
    if (!podList) return;
    podList.replaceChildren();
    const wave = currentWave(store);
    for (const pod of wave?.pods ?? []) {
      podList.appendChild(podRow(pod));
    }
  };

  const renderNote = (): void => {
    if (!note) return;
    const wave = currentWave(store);
    if (!wave) {
      note.textContent = "";
      return;
    }
    const beats = beatCount(wave);
    const seconds = ((beats * 60) / cfg().bpm).toFixed(1);
    const pods = wave.pods?.length ?? 0;
    note.textContent =
      `${wave.entries.length} entries · ${pods} pods · ${beats} beats ≈ ${seconds}s at ` +
      `${cfg().bpm} BPM. Columns are the seven a wave is authored against; the ` +
      `field plays ${cfg().cols} and mapCol remaps them.`;
  };

  return {
    render: () => {
      renderPods();
      renderNote();
    },
  };
}

/** The mark a pod is drawn with — in its row under the map, and in the cell
 * itself (`grid.ts`). One glyph table, so the two cannot disagree. */
export function podGlyph(brush: Brush): string {
  switch (brush) {
    case "purge":
      return "✦";
    case "ward":
      return "◎";
    default:
      return "◇";
  }
}
