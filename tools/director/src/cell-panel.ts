import type { Wave } from "@neon-spore/content";
import { cellConfig } from "./cell-config.js";
import type { Selection } from "./selection.js";
import { silhouette } from "./silhouette.js";
import {
  BRUSHES,
  brushOf,
  cellIsEmpty,
  currentWave,
  entryAt,
  eraseAt,
  podAt,
  podBrushOf,
  type Store,
} from "./state.js";

/**
 * The panel under the map: what the selected cell holds, and what can be done
 * to it.
 *
 * **It is where per-entry configuration lives.** Everything a wave could say
 * about an arrival used to be said by *which brush* placed it — five meteor
 * brushes for five fall speeds, and no way at all to say what colour the body
 * inside a shell was. That does not scale: every new number would be another
 * row of buttons in a palette that is already scrolled, and speed crossed with
 * width would have been ten. A selected cell with its own fields underneath is
 * one button and one number instead, and the fields are per-arrival rather
 * than per-brush. `cell-config.ts` draws them; the rows a given arrival has no
 * answer for are simply not there.
 *
 * **It also holds the removal.** A click on an occupied cell used to take its
 * contents away (`state.ts` says why that had to stop), so removal needed
 * somewhere to go: the `Delete` and `Backspace` keys and the held press are
 * bound in `grid.ts`, where the cells are, and DELETE here is the same verb
 * for a hand that has neither a keyboard nor the patience for a long press.
 * All three funnel into `eraseAt`.
 *
 * **Selecting is how an author reaches this panel at all.** A cell no longer
 * paints when it is clicked — clicking only selects it (`grid.ts`) — so a
 * click on whatever is already there is the whole way in: the panel below
 * names it and offers its own fields, and painting over it with a different
 * brush is one click on the palette away.
 */
export interface CellPanel {
  render(): void;
}

export interface CellPanelOptions {
  store: Store;
  selection: Selection;
  /** A wave changed shape: redraw everything that draws it. */
  onEdit(): void;
}

export function bindCellPanel({ store, selection, onEdit }: CellPanelOptions): CellPanel {
  const root = document.getElementById("cellPanel");

  const render = (): void => {
    if (!root) return;
    root.replaceChildren();
    const wave = currentWave(store);
    const at = selection.at();

    root.appendChild(heading(at));
    if (wave && at) root.appendChild(contents(wave, at.beat, at.col));
    // What the arrival in this cell *is* — a rock's speed and width, the body
    // behind a shell (`cell-config.ts`). Nothing at all when the cell is empty
    // or holds something with nothing to say about itself.
    const config =
      wave && at
        ? cellConfig({
            entry: () => entryAt(wave, at.beat, at.col),
            onEdit: () => {
              store.dirty = true;
              onEdit();
              render();
            },
          })
        : null;
    if (config) root.appendChild(config);
    root.appendChild(actions(wave, at));
  };

  const heading = (at: { beat: number; col: number } | null): HTMLElement => {
    const h = document.createElement("h2");
    h.textContent = at ? `CELL — BEAT ${at.beat} · COL ${at.col}` : "CELL";
    return h;
  };

  /** What is in the cell, drawn the way the grid draws it so the two cannot
   * come to disagree about what a cell holds. */
  const contents = (wave: Wave, beat: number, col: number): HTMLElement => {
    const row = document.createElement("div");
    row.className = "cell-holds";

    const entry = entryAt(wave, beat, col);
    if (entry) {
      const spec = BRUSHES.find((x) => x.brush === brushOf(entry));
      if (spec?.subjects.length) row.appendChild(silhouette(spec.subjects[0]!, spec.stroke, 26));
      row.appendChild(labelSpan(spec?.label ?? brushOf(entry)));
    }

    const pod = podAt(wave, beat, col);
    if (pod) {
      const spec = BRUSHES.find((x) => x.brush === podBrushOf(pod));
      row.appendChild(labelSpan(`${spec?.label ?? "POD"} · row ${pod.row}`));
    }

    if (!entry && !pod) row.appendChild(labelSpan("empty"));
    return row;
  };

  const actions = (
    wave: Wave | undefined,
    at: { beat: number; col: number } | null,
  ): HTMLElement => {
    const row = document.createElement("div");
    row.className = "cell-actions";

    const del = document.createElement("button");
    del.type = "button";
    del.id = "cellDelete";
    del.textContent = "DELETE";
    // Nothing selected, or nothing in what is selected: the button would do
    // nothing, and a button that does nothing teaches that the ones beside it
    // might not either.
    del.disabled = !wave || !at || cellIsEmpty(wave, at.beat, at.col);
    del.addEventListener("click", () => {
      if (!wave || !at) return;
      eraseAt(wave, at.beat, at.col);
      store.dirty = true;
      onEdit();
    });

    row.append(del);
    return row;
  };

  selection.watch(render);
  render();
  return { render };
}

function labelSpan(text: string): HTMLElement {
  const span = document.createElement("span");
  span.textContent = text;
  return span;
}
