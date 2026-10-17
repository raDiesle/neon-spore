import type { Wave } from "@neon-spore/content";
import type { SimConfig } from "@neon-spore/sim";
import { cellConfig } from "./cell-config.js";
import { podConfig } from "./cell-config-pod.js";
import { labelled } from "./cell-config-rows.js";
import { bindCellPopover } from "./cell-popover.js";
import { faultConfig } from "./fault-config.js";
import type { Selection } from "./selection.js";
import { cellIsEmpty, currentWave, entryAt, eraseAt, podAt, type Store } from "./state.js";

/**
 * The selected cell's panel: what can be done to what it holds. It floats
 * over the map beside the tile, and only while the pointer is on one or the
 * other (`cell-popover.ts`). It does not name the cell or draw what is in it:
 * the tile already draws it, its tooltip already names it, and the ring
 * already says which tile it is (the owner, 17 October 2026).
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
 * **And it holds the row's own malfunctions.** A fault has no column — it is a
 * beat it enters on and a number of beats it holds — so it is not a fact about
 * a cell, but the row a cell is on is the only thing a click on the map points
 * at it with. Since 18 September 2026 it is the only place a fault is authored
 * at all: the picker in the WAVE SETTINGS column is gone, and `fault-config.ts`
 * says why.
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
 * click on whatever is already there is the whole way in: the panel offers
 * its own fields, and painting over it with a different brush is one click on
 * the palette away.
 */
export interface CellPanel {
  render(): void;
}

export interface CellPanelOptions {
  store: Store;
  selection: Selection;
  /** The shipped numbers, live: a pod's row and its crossing speed are both
   * bounded by them, and the tuning sheet may have moved either. */
  cfg(): SimConfig;
  /** A wave changed shape: redraw everything that draws it. */
  onEdit(): void;
}

export function bindCellPanel({ store, selection, cfg, onEdit }: CellPanelOptions): CellPanel {
  const root = document.getElementById("cellPanel");
  const grid = document.getElementById("grid");
  const popover = root && grid ? bindCellPopover(root, grid, selection) : null;

  const render = (): void => {
    if (!root) return;
    root.replaceChildren();
    const wave = currentWave(store);
    const at = selection.at();
    if (!wave || !at) {
      popover?.place();
      return;
    }
    const edited = (): void => {
      store.dirty = true;
      onEdit();
      render();
    };
    // What the arrival in this cell *is* — a rock's speed and width, the body
    // behind a shell (`cell-config.ts`). Nothing at all when the cell is empty
    // or holds something with nothing to say about itself.
    const config = cellConfig({
      wave,
      entry: () => entryAt(wave, at.beat, at.col),
      onEdit: edited,
    });
    if (config) root.appendChild(config);
    // And what the *pod* in this cell is: the row it hangs at, whether it
    // crosses, and how fast. Its three fields used to be a line in a list under
    // the map — the one thing in this editor configured by finding it in a list
    // rather than by pointing at it — and the owner asked for them in this panel with
    // everything else (`cell-config-pod.ts`).
    const pod = podAt(wave, at.beat, at.col);
    if (pod) root.appendChild(podConfig({ pod, cfg: cfg(), labelled, onEdit: edited }));
    // And what the *row* carries, which is the one thing in this panel that
    // is not about a cell at all: a malfunction has no column, so it belongs to
    // the beat the selection is on rather than to the tile (`fault-config.ts`).
    // It is last because it is the widest in scope — the cell, then the pod in
    // it, then the row all three are on.
    const faults = faultConfig({ wave, beat: at.beat, onEdit: edited });
    if (faults) root.appendChild(faults);
    // DELETE only where there is something to take away; an empty cell with
    // no fault on its row has no panel at all.
    if (!cellIsEmpty(wave, at.beat, at.col)) root.appendChild(actions(wave, at));
    popover?.place();
  };

  const actions = (wave: Wave, at: { beat: number; col: number }): HTMLElement => {
    const row = document.createElement("div");
    row.className = "cell-actions";

    const del = document.createElement("button");
    del.type = "button";
    del.id = "cellDelete";
    del.textContent = "DELETE";
    del.addEventListener("click", () => {
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
