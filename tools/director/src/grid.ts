import { AUTHORED_COLS, mapCol, type Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import type { Brush } from "./brushes.js";
import { fillCell } from "./grid-cell-art.js";
import { bindFollow } from "./grid-follow.js";
import { bindCellGestures, watchStrokeEnd } from "./grid-gestures.js";
import { CELL_PX, GAP_PX, gridTemplateColumns } from "./grid-metrics.js";
import { bindGridNote } from "./grid-note.js";
import { repriseBand, repriseEchoes } from "./grid-reprise.js";
import { bindRowActs } from "./grid-row-acts.js";
import { beatLabel, bindRowVerbs } from "./grid-rows.js";
import type { Held } from "./held.js";
import { faultMarks } from "./paint-fault.js";
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
import { isTyping } from "./typing.js";

/**
 * The beat grid: beats down, the seven authored columns across.
 *
 * Seven, not `cfg.cols` — a wave is authored against seven and `mapCol`
 * remaps it onto whatever field it is played on. Editing against the real
 * eleven would let you place a creature in a column that no authored wave can
 * express, and the remap would silently move it.
 *
 * What a cell *draws* is `grid-cell-art.ts`, what a hand *does* to one is
 * `grid-gestures.ts`, what a beat's label does is `grid-rows.ts`, what a row
 * can be done to is `grid-row-acts.ts`, how the map keeps up with the beat
 * playing is `grid-follow.ts`, and what sits under the map is `grid-note.ts`;
 * this file is the map itself — the columns and the beats.
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
  // A row opened, a row taken out, and the asking a removal does first:
  // `grid-rows.ts`.
  const rows = bindRowVerbs(store, selection, onEdit);
  // A line between two rows, and a trash at the end of one (`grid-row-acts.ts`).
  const acts = grid ? bindRowActs(grid, rows, selection) : null;
  // How much map after the beat playing has to stay on screen: four rows, the
  // ones an author edits while the wave runs (`grid-follow.ts`).
  const follow = grid ? bindFollow(grid, () => 4 * (CELL_PX + GAP_PX)) : null;

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
    grid.style.gridTemplateColumns = gridTemplateColumns();
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
    // The ninth track's own head, empty. Without it the first beat label is
    // auto-placed into the head row rather than under it.
    grid.appendChild(label("head", ""));

    const beats = beatCount(wave);
    // The faults of the whole wave in one pass, so the beat column can show
    // where each one enters and how far down it holds (`paint-fault.ts`).
    const faults = faultMarks(wave, beats);
    for (let b = 0; b < beats; b++) {
      grid.appendChild(beatLabel(b, onSeek, faults[b]));
      for (let c = 0; c < AUTHORED_COLS; c++) grid.appendChild(cell(wave, b, c));
      if (acts) grid.appendChild(acts.end(b, faults[b]));
    }
    // Last, so a rail is drawn over the row it belongs to rather than under
    // it — each one names its own row, so the order here is only paint order.
    if (acts) {
      for (let b = 0; b < beats; b++) grid.appendChild(acts.rail(b));
      for (let b = 0; b < beats; b++) {
        const band = acts.band(b, faults[b]);
        if (band) grid.appendChild(band);
      }
    }
    // THE REPRISE's echoes, each across the row its dark falls after
    // (`grid-reprise.ts`).
    for (const echo of repriseEchoes(wave)) {
      if (echo.lastRow < beats) grid.appendChild(repriseBand(echo));
    }
    mark(markedBeat);
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

  /**
   * Ring the selected cell. Its own pass rather than a re-render: selecting a
   * cell is the commonest thing that happens to the map, and rebuilding every
   * button in it to move one ring dropped the stroke a pointer was in the
   * middle of. Until this existed nothing moved the ring at all between
   * edits — the class was only ever written by a render.
   */
  const ring = (): void => {
    if (!grid) return;
    for (const el of grid.querySelectorAll(".cell.sel")) el.classList.remove("sel");
    const at = selection.at();
    if (!at) return;
    grid.querySelector(`.cell[data-beat="${at.beat}"][data-col="${at.col}"]`)?.classList.add("sel");
  };
  selection.watch(ring);

  const mark = (beat: number): void => {
    markedBeat = beat;
    if (!grid) return;
    for (const el of grid.querySelectorAll(".now")) {
      el.classList.remove("now");
    }
    for (const el of grid.querySelectorAll(`[data-beat="${beat}"]`)) {
      el.classList.add("now");
    }
    follow?.to(grid.querySelector<HTMLElement>(`.beat[data-beat="${beat}"]`));
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

function label(cls: string, text: string): HTMLElement {
  const el = document.createElement("div");
  el.className = cls;
  el.textContent = text;
  return el;
}
