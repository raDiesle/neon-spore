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

    row.append(where, input, crossPicker(pod), speedBox(pod));
    return row;
  };

  /**
   * Which way it crosses the field, or nothing at all.
   *
   * Three states rather than a checkbox and a direction, because the middle
   * one is not "crossing, neither way" — it is a pod that **hangs**, which is
   * what every pod in the game was before THE CLAW and is still the default.
   * Absent rather than `0` in the wave file, so a wave nobody has touched is
   * byte-for-byte the wave it was (`PodEntry.cross`).
   */
  const crossPicker = (pod: PodEntry): HTMLElement => {
    const pick = document.createElement("select");
    pick.title = "hangs where it is placed, or crosses the field along its row";
    for (const [value, label] of [
      ["", "hangs"],
      ["-1", "◀ crosses"],
      ["1", "crosses ▶"],
    ] as const) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      pick.appendChild(option);
    }
    pick.value = pod.cross === undefined ? "" : String(pod.cross);
    pick.addEventListener("change", () => {
      if (pick.value === "") delete pod.cross;
      else pod.cross = pick.value === "-1" ? -1 : 1;
      store.dirty = true;
      onEdit();
    });
    return pick;
  };

  /** How fast it crosses, in tiles per beat. Empty is `podCrossTilesPerBeat`,
   * and it says nothing at all about a pod that hangs. */
  const speedBox = (pod: PodEntry): HTMLElement => {
    const box = document.createElement("input");
    box.type = "number";
    box.step = "0.5";
    box.min = "0.5";
    box.max = "12";
    box.title = `tiles a beat while crossing — empty is ${cfg().podCrossTilesPerBeat}`;
    box.value = pod.speed === undefined ? "" : String(pod.speed);
    box.addEventListener("change", () => {
      const next = Number(box.value);
      if (box.value === "") delete pod.speed;
      else if (Number.isFinite(next) && next >= 0.5 && next <= 12) pod.speed = next;
      else {
        box.value = pod.speed === undefined ? "" : String(pod.speed);
        return;
      }
      store.dirty = true;
      onEdit();
    });
    return box;
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
