import { AUTHORED_COLS, mapCol, type Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { brushArtImage } from "./brush-art.js";
import { bindGridPods, podGlyph } from "./grid-pods.js";
import type { Selection } from "./selection.js";
import { silhouette } from "./silhouette.js";
import {
  BRUSHES,
  beatCount,
  brushOf,
  currentWave,
  entryAt,
  eraseAt,
  podAt,
  podBrushOf,
  type Store,
} from "./state.js";

/**
 * How long a press has to be held before it empties the cell under it. The
 * gesture exists for the phone, where there is no `Delete` key and DELETE
 * under the map costs a trip there and back for a single correction.
 *
 * Long enough not to fire on a tap somebody meant as a paint stroke, short
 * enough to be discovered by accident — which is the only way anybody ever
 * finds a long press.
 */
const HOLD_TO_ERASE_MS = 500;

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
  onEdit: () => void,
  onSeek: (beat: number) => void,
  selection: Selection,
): GridPanel {
  const grid = document.getElementById("grid");
  // The pod list and the wave's arithmetic — under the map, about the wave
  // rather than about a cell. See `grid-pods.ts`.
  const pods = bindGridPods(store, cfg, onEdit);
  let markedBeat = 0;

  /**
   * Empty the selected cell. The `Delete` key, the `Backspace` key and the
   * held press all arrive here, and so does the panel's own button through
   * `eraseAt` — one verb, four ways in (`cell-panel.ts`).
   */
  const eraseSelected = (): void => {
    const wave = currentWave(store);
    const at = selection.at();
    if (!wave || !at) return;
    eraseAt(wave, at.beat, at.col);
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

    const entry = entryAt(wave, b, c);
    if (entry) {
      const brush = brushOf(entry);
      // The same picture the palette's chip carries (`brush-art.ts`), so what
      // a cell holds and what was clicked to put it there are one drawing and
      // not two. The plain contour is still the fallback, for the one brush
      // that has no picture.
      const art = brushArtImage(brush, 26);
      if (art) {
        button.appendChild(art);
      } else {
        const spec = BRUSHES.find((x) => x.brush === brush);
        if (spec && spec.subjects.length > 0) {
          button.appendChild(silhouette(spec.subjects[0]!, spec.stroke, 26));
        }
      }
    }
    const pod = podAt(wave, b, c);
    if (pod) {
      const mark = document.createElement("span");
      mark.className = "pod";
      mark.textContent = `${podGlyph(podBrushOf(pod))}${pod.row}`;
      const spec = BRUSHES.find((x) => x.brush === podBrushOf(pod));
      if (spec) mark.style.color = spec.stroke;
      button.appendChild(mark);
    }

    // A press held down empties the cell, and cancels the click that would
    // otherwise have painted over it on release. `held` is what carries that
    // refusal from the timer to the click listener — the two are different
    // events on the same button, and there is nothing else they share.
    let held = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startHold = (): void => {
      held = false;
      timer = setTimeout(() => {
        held = true;
        selection.set({ beat: b, col: c });
        eraseSelected();
      }, HOLD_TO_ERASE_MS);
    };
    const endHold = (): void => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };
    button.addEventListener("pointerdown", startHold);
    button.addEventListener("pointerup", endHold);
    button.addEventListener("pointercancel", endHold);
    // A finger that slid off the cell it started on never meant to hold it.
    button.addEventListener("pointerleave", endHold);

    button.addEventListener("click", () => {
      if (held) {
        held = false;
        return;
      }
      // Selects and nothing more — painting is the palette's job now
      // (`palette.ts`). A click here is how a tile is pointed at, whether
      // that is to place something in it or to see what is already there.
      selection.set({ beat: b, col: c });
    });
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
    pods.render();
  };

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
