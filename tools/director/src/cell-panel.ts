import type { Wave } from "@neon-spore/content";
import type { Selection } from "./selection.js";
import { silhouette } from "./silhouette.js";
import {
  BRUSHES,
  type Brush,
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
 * **It is where per-entry configuration will live.** Everything a wave can say
 * about an arrival is currently said by *which brush* placed it — five meteor
 * brushes for five fall speeds, and no way at all to say how long one body
 * stays armoured. That does not scale: every new number would be another row
 * of buttons in a palette that is already scrolled. A selected cell with its
 * own fields underneath is one button and one number instead, and the fields
 * are per-arrival rather than per-brush.
 *
 * This lane builds the panel and the selection it reads; the fields themselves
 * arrive with the kinds that need them.
 *
 * **It also holds the removals**, all three of them, because they are one
 * verb and used to be four. A click on an occupied cell used to take its
 * contents away (`state.ts` says why that had to stop), so removal needed
 * somewhere to go: the `Delete` and `Backspace` keys and the held press are
 * bound in `grid.ts`, where the cells are, and the two buttons here are the
 * same verb for a hand that has neither a keyboard nor the patience for a long
 * press. All four funnel into `eraseAt`.
 *
 * The two buttons are deliberately different verbs and say so:
 * `DELETE` acts once, on the cell that is selected right now. `ERASE` is the
 * brush — a mode, where every cell touched afterwards is emptied — and it is
 * the one that moved down here out of the palette, because this is where the
 * author is already looking when something needs taking back.
 */
export interface CellPanel {
  render(): void;
}

export interface CellPanelOptions {
  store: Store;
  selection: Selection;
  /** The brush currently held, and how to change it — the ERASE button is a
   * brush selector, so it has to be able to write the palette's own state. */
  brush: { current(): Brush; pick(brush: Brush): void };
  /** A wave changed shape: redraw everything that draws it. */
  onEdit(): void;
}

export function bindCellPanel({ store, selection, brush, onEdit }: CellPanelOptions): CellPanel {
  const root = document.getElementById("cellPanel");

  const render = (): void => {
    if (!root) return;
    root.replaceChildren();
    const wave = currentWave(store);
    const at = selection.at();

    root.appendChild(heading(at));
    if (wave && at) root.appendChild(contents(wave, at.beat, at.col));
    root.appendChild(actions(wave, at));
    root.appendChild(note());
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

    const eraseSpec = BRUSHES.find((b) => b.brush === "erase");
    const erase = document.createElement("button");
    erase.type = "button";
    erase.id = "cellErase";
    erase.className = brush.current() === "erase" ? "on" : "";
    erase.textContent = "ERASE";
    erase.title = eraseSpec?.note ?? "";
    erase.addEventListener("click", () => {
      // A toggle, not a one-way door: the brush it falls back to is the first
      // one the palette offers, which is what `bindPalette` opens on anyway.
      brush.pick(brush.current() === "erase" ? (BRUSHES[0]?.brush ?? "erase") : "erase");
      onEdit();
    });

    row.append(del, erase);
    return row;
  };

  const note = (): HTMLElement => {
    const p = document.createElement("p");
    p.className = "note";
    p.textContent =
      "A click selects and paints; it no longer takes back what it lands on. " +
      "Delete or Backspace empties the selected cell, and so does holding a " +
      "press on it — which is the one that works without a keyboard. ERASE is " +
      "the same verb as a brush: every cell touched while it is lit is emptied.";
    return p;
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
