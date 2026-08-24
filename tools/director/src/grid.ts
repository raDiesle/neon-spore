import { AUTHORED_COLS, type Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import {
  BRUSHES,
  type Brush,
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
}

export function bindGrid(store: Store, cfg: () => SimConfig, onEdit: () => void): GridPanel {
  const brushBar = document.getElementById("brushes");
  const grid = document.getElementById("grid");
  const podList = document.getElementById("podList");
  const note = document.getElementById("gridNote");
  let brush: Brush = "alt";

  const renderBrushes = (): void => {
    if (!brushBar) return;
    brushBar.replaceChildren();
    for (const b of BRUSHES) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${b.glyph} ${b.label}`;
      button.className = b.brush === brush ? "on" : "";
      button.addEventListener("click", () => {
        brush = b.brush;
        renderBrushes();
      });
      brushBar.appendChild(button);
    }
  };

  const renderGrid = (): void => {
    if (!grid) return;
    const wave = currentWave(store);
    grid.replaceChildren();
    if (!wave) return;

    grid.style.gridTemplateColumns = `24px repeat(${AUTHORED_COLS}, 32px)`;
    grid.appendChild(label("head", ""));
    for (let c = 0; c < AUTHORED_COLS; c++) grid.appendChild(label("head", String(c)));

    for (let b = 0; b < beatCount(wave); b++) {
      grid.appendChild(label("beat", String(b)));
      for (let c = 0; c < AUTHORED_COLS; c++) grid.appendChild(cell(wave, b, c));
    }
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
      button.textContent = spec?.glyph ?? "?";
      button.classList.add(spec?.cls ?? "");
    }
    const pod = podAt(wave, b, c);
    if (pod) {
      const mark = document.createElement("span");
      mark.className = "pod";
      mark.textContent = `◇${pod.row}`;
      button.appendChild(mark);
    }

    button.addEventListener("click", () => {
      paint(wave, b, c, brush);
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

  const render = (): void => {
    renderBrushes();
    renderGrid();
    renderPods();
    renderNote();
  };

  render();
  return { render };
}

function label(cls: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return el;
}
