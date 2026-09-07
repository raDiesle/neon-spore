import { AUTHORED_COLS, mapCol, type Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Brush } from "./brushes.js";
import { fillCell } from "./grid-cell-art.js";
import { bindCellGestures, watchStrokeEnd } from "./grid-gestures.js";
import { bindGridNote } from "./grid-note.js";
import type { Held } from "./held.js";
import type { Cell, Selection } from "./selection.js";
import {
  beatCount,
  cellIsEmpty,
  currentWave,
  eraseAt,
  moveCell,
  paint,
  type Store,
} from "./state.js";

/**
 * The beat grid: beats down, the seven authored columns across.
 *
 * Seven, not `cfg.cols` — a wave is authored against seven and `mapCol`
 * remaps it onto whatever field it is played on. Editing against the real
 * eleven would let you place a creature in a column that no authored wave can
 * express, and the remap would silently move it.
 *
 * What a cell *draws* is `grid-cell-art.ts`, what a hand *does* to one is
 * `grid-gestures.ts`, and what sits under the map is `grid-note.ts`; this file
 * is the map itself — the labels, the columns and the beats.
 */
export interface GridPanel {
  render(): void;
  mark(beat: number): void;
}

export function bindGrid(
  store: Store,
  cfg: () => SimConfig,
  onEdit: () => void,
  onSeek: (beat: number) => void,
  selection: Selection,
  held: Held,
): GridPanel {
  const grid = document.getElementById("grid");
  // The wave's own arithmetic — under the map, about the wave rather than
  // about a cell. See `grid-note.ts`.
  const note = bindGridNote(store, cfg);
  let markedBeat = 0;

  /**
   * Empty the selected cell. The `Delete` key, the `Backspace` key and the
   * held press all arrive here, and so does the panel's own button through
   * `eraseAt` — one verb, four ways in (`cell-panel.ts`).
   */
  const eraseSelected = (): void => {
    const at = selection.at();
    if (at) eraseCell(at);
  };

  /** The four verbs a cell's gestures spend, in one place: each marks the wave
   * dirty and settles everything an edit touches, so no gesture has to
   * remember to (`grid-gestures.ts`). */
  const eraseCell = (cell: Cell): void => {
    const wave = currentWave(store);
    if (!wave) return;
    eraseAt(wave, cell.beat, cell.col);
    store.dirty = true;
    onEdit();
  };
  const paintCell = (cell: Cell, brush: Brush): void => {
    const wave = currentWave(store);
    if (!wave) return;
    // Selected first, so the panel above the map is already pointing at the
    // cell by the time the edit redraws it — a stroke leaves the last cell it
    // crossed under the author's attention, which is where they are looking.
    selection.set(cell);
    paint(wave, cell.beat, cell.col, brush);
    store.dirty = true;
    onEdit();
  };
  const moveInto = (from: Cell, to: Cell): void => {
    const wave = currentWave(store);
    if (!wave) return;
    moveCell(wave, from, to);
    selection.set(to);
    store.dirty = true;
    onEdit();
  };

  // Bound on the window rather than on a cell: the selection outlives the
  // element that made it — a re-render replaces every button in the grid — so
  // a listener on the cell would be listening for a key on a node that no
  // longer exists. Ignored while a field has focus, or Backspace in the wave's
  // name would delete a creature instead of a letter.
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    if (isTyping(document.activeElement)) return;
    if (!selection.at()) return;
    e.preventDefault();
    eraseSelected();
  });

  const renderGrid = (): void => {
    if (!grid) return;
    const wave = currentWave(store);
    grid.replaceChildren();
    if (!wave) return;

    // The whole map says which mode it is in. A brush is armed, so a click
    // places rather than points and a drag paints a stroke — and the cursor is
    // the only place that can be said without a label (`director-map.css`).
    grid.classList.toggle("armed", held.brush() !== null);
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
    const at = selection.at();
    const isSelected = at?.beat === b && at.col === c;
    button.className = `cell${b === 0 ? " beat0" : ""}${isSelected ? " sel" : ""}`;
    button.dataset.beat = String(b);
    button.dataset.col = String(c);

    fillCell(button, wave, b, c);

    bindCellGestures(
      button,
      { beat: b, col: c },
      {
        held,
        select: (cell) => selection.set(cell),
        paint: paintCell,
        erase: eraseCell,
        move: moveInto,
        isEmpty: (cell) => cellIsEmpty(wave, cell.beat, cell.col),
      },
    );
    return button;
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
    note.render();
  };

  // Ends a stroke wherever the button came up, including outside the grid.
  watchStrokeEnd();
  render();
  return { render, mark };
}

/**
 * Whether the keyboard currently belongs to a field rather than to the map.
 * `Backspace` is the character the wave's name and sentence are corrected
 * with, and a global listener that did not ask this would delete a creature
 * every time somebody fixed a typo.
 */
function isTyping(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return (el as HTMLElement).isContentEditable === true;
}

function label(cls: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return el;
}
