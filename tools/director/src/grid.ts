import { AUTHORED_COLS, mapCol, type Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Palette } from "./palette.js";
import { silhouette } from "./silhouette.js";
import {
  BRUSHES,
  beatCount,
  brushOf,
  currentWave,
  entryAt,
  paint,
  podAt,
  type Store,
} from "./state.js";

/**
 * The beat grid: beats down, the seven authored columns across.
 *
 * Seven, not `cfg.cols` — a wave is authored against seven and `mapCol`
 * remaps it onto whatever field it is played on. Editing against the real
 * eleven would let you place a creature in a column that no authored wave can
 * express, and the remap would silently move it.
 */
export interface GridPanel {
  render(): void;
  mark(beat: number): void;
}

export function bindGrid(
  store: Store,
  cfg: () => SimConfig,
  palette: Palette,
  onEdit: () => void,
  onSeek: (beat: number) => void,
): GridPanel {
  const grid = document.getElementById("grid");
  const podList = document.getElementById("podList");
  const note = document.getElementById("gridNote");
  let markedBeat = 0;

  const renderGrid = (): void => {
    if (!grid) return;
    const wave = currentWave(store);
    grid.replaceChildren();
    if (!wave) return;

    grid.style.gridTemplateColumns = `24px repeat(${AUTHORED_COLS}, 32px)`;
    grid.appendChild(label("head", ""));
    for (let c = 0; c < AUTHORED_COLS; c++) {
      const mapped = mapCol(c, cfg().cols);
      const head = document.createElement("div");
      head.className = "head";
      head.textContent = String(c);
      const maps = document.createElement("span");
      maps.className = "maps";
      maps.textContent = `↓${mapped}`;
      head.appendChild(maps);
      grid.appendChild(head);
    }

    for (let b = 0; b < beatCount(wave); b++) {
      grid.appendChild(beatLabel(b));
      for (let c = 0; c < AUTHORED_COLS; c++) grid.appendChild(cell(wave, b, c));
    }
    mark(markedBeat);
  };

  const beatLabel = (b: number): HTMLElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "beat";
    button.textContent = String(b);
    button.dataset.beat = String(b);
    button.addEventListener("click", () => onSeek(b));
    return button;
  };

  const cell = (wave: Wave, b: number, c: number): HTMLElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = b === 0 ? "cell beat0" : "cell";
    button.dataset.beat = String(b);
    button.dataset.col = String(c);

    const entry = entryAt(wave, b, c);
    if (entry) {
      const spec = BRUSHES.find((x) => x.brush === brushOf(entry));
      if (spec && spec.subjects.length > 0) {
        button.appendChild(silhouette(spec.subjects[0]!, spec.stroke, 26));
      }
    }
    const pod = podAt(wave, b, c);
    if (pod) {
      const mark = document.createElement("span");
      mark.className = "pod";
      mark.textContent = `◇${pod.row}`;
      button.appendChild(mark);
    }

    button.addEventListener("click", () => {
      paint(wave, b, c, palette.current());
      store.dirty = true;
      onEdit();
    });
    return button;
  };

  const renderPods = (): void => {
    if (!podList) return;
    podList.replaceChildren();
    const wave = currentWave(store);
    for (const pod of wave?.pods ?? []) {
      podList.appendChild(podRow(pod));
    }
  };

  const podRow = (pod: { beat: number; col: number; row: number }): HTMLElement => {
    const row = document.createElement("div");
    row.className = "pod-row";
    const where = document.createElement("span");
    where.textContent = `◇ beat ${pod.beat} · col ${pod.col} · row`;

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

  const mark = (beat: number): void => {
    markedBeat = beat;
    if (!grid) return;
    for (const el of grid.querySelectorAll(".now")) {
      el.classList.remove("now");
    }
    for (const el of grid.querySelectorAll(`[data-beat="${beat}"]`)) {
      el.classList.add("now");
    }
  };

  const render = (): void => {
    renderGrid();
    renderPods();
    renderNote();
  };

  render();
  return { render, mark };
}

function label(cls: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return el;
}
