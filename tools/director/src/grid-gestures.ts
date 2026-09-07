import type { Brush } from "./brushes.js";
import type { Held } from "./held.js";
import type { Cell } from "./selection.js";

/**
 * **Everything a hand can do to one cell of the map**: point at it, paint it,
 * drag a stroke across it, drop something on it, drag its contents somewhere
 * else, and hold it down to empty it.
 *
 * Cut out of `grid.ts` when drag and drop arrived and that file went past its
 * 250-line limit. The seam is honest rather than convenient — next door is
 * what the map *is* (the labels, the columns, the beats, what a cell draws)
 * and this is what happens when a pointer touches one. Nothing here reads a
 * wave or writes one: every verb is handed in.
 *
 * ## The two modes, and why there are two
 *
 * With **no brush armed** the map is a thing you point at. A click selects, a
 * press held down empties (there is no `Delete` key on a phone), and a cell
 * with something in it can be picked up and dropped on another cell, which
 * moves what is in it. That is the editor as it shipped, plus the move.
 *
 * With **a brush armed** the map is a surface you paint. A press paints at
 * once and a drag goes on painting every cell it crosses, which is the gesture
 * every tile editor has and the one the owner asked for. The long press to
 * erase is deliberately *not* offered in this mode: an armed brush means the
 * hand is placing things, and a press that paints and then — half a second
 * later, without moving — takes the cell away instead would be the one gesture
 * in the tool that does two opposite things.
 *
 * ## Why the press paints and the click does not
 *
 * Painting rebuilds the grid, which replaces every button in it — including
 * the one under the finger. So a cell that painted on `click` would be a cell
 * whose `pointerup` never arrives, and a stroke could never be started from
 * one. The press is the whole gesture instead: it selects, it paints, and it
 * opens the stroke, and nothing afterwards is owed to a node that no longer
 * exists. That is also why the erase timer is not started in this mode — its
 * `clearTimeout` hangs off the same dead node.
 */

/** Whether a stroke is in progress, which is a fact about the pointer rather
 * than about any one cell — the cells it crosses are separate elements, and
 * the ones it has already painted have been replaced. */
let stroking = false;

/** How long a press has to be held before it empties the cell under it. The
 * gesture exists for the phone, where there is no `Delete` key and DELETE
 * above the map costs a trip there and back for a single correction.
 *
 * Long enough not to fire on a tap somebody meant as a selection, short enough
 * to be discovered by accident — which is the only way anybody ever finds a
 * long press. */
const HOLD_TO_ERASE_MS = 500;

export interface CellVerbs {
  held: Held;
  /** Point at this cell. */
  select(cell: Cell): void;
  /** Put `brush` in this cell, and select it. */
  paint(cell: Cell, brush: Brush): void;
  /** Empty this cell. */
  erase(cell: Cell): void;
  /** Move whatever is in `from` into `to`. */
  move(from: Cell, to: Cell): void;
  /** Whether there is anything in this cell to pick up. */
  isEmpty(cell: Cell): boolean;
}

/** Ends any stroke, wherever the button came up. Bound once, on the window,
 * because a drag that leaves the grid altogether still ends there. */
export function watchStrokeEnd(): void {
  const stop = (): void => {
    stroking = false;
  };
  window.addEventListener("pointerup", stop);
  window.addEventListener("pointercancel", stop);
  window.addEventListener("blur", stop);
}

export function bindCellGestures(button: HTMLElement, cell: Cell, v: CellVerbs): void {
  const armed = v.held.brush();

  // A cell with something in it is a cell that can be picked up — but only
  // while nothing is armed, or the press that starts a native drag would be
  // the press that starts a stroke, and the browser would win.
  button.draggable = armed === null && !v.isEmpty(cell);
  button.addEventListener("dragstart", (e) => {
    v.held.drag({ kind: "cell", from: cell });
    // The OS wants something to carry even when nothing reads it back.
    e.dataTransfer?.setData("text/plain", `${cell.beat},${cell.col}`);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  });
  button.addEventListener("dragend", () => {
    v.held.drag(null);
    button.classList.remove("over");
  });

  // The drop side. `preventDefault` on both is what makes a cell a target at
  // all, and it is refused for a cell dropped on itself so the pointer says
  // so rather than the wave quietly not changing.
  const wants = (): boolean => {
    const carrying = v.held.dragging();
    if (!carrying) return false;
    if (carrying.kind === "brush") return true;
    return carrying.from.beat !== cell.beat || carrying.from.col !== cell.col;
  };
  const over = (e: DragEvent): void => {
    if (!wants()) return;
    e.preventDefault();
    button.classList.add("over");
  };
  button.addEventListener("dragenter", over);
  button.addEventListener("dragover", over);
  button.addEventListener("dragleave", () => button.classList.remove("over"));
  button.addEventListener("drop", (e) => {
    button.classList.remove("over");
    const carrying = v.held.dragging();
    if (!wants() || !carrying) return;
    e.preventDefault();
    v.held.drag(null);
    if (carrying.kind === "brush") v.paint(cell, carrying.brush);
    else v.move(carrying.from, cell);
  });

  if (armed !== null) {
    // Painting. The press does the whole of it — see the note at the top of
    // this file about the node it destroys.
    button.addEventListener("pointerdown", () => {
      stroking = true;
      v.paint(cell, armed);
    });
    // And every cell the drag crosses afterwards. `buttons` rather than the
    // stroke flag alone: a pointer that came up over a panel this file never
    // hears about must not go on painting on its way back.
    button.addEventListener("pointerenter", (e) => {
      if (!stroking || (e.buttons & 1) === 0) return;
      v.paint(cell, armed);
    });
    return;
  }

  // Nothing armed: the map points and holds.
  let heldDown = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const endHold = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  button.addEventListener("pointerdown", () => {
    heldDown = false;
    timer = setTimeout(() => {
      heldDown = true;
      v.select(cell);
      v.erase(cell);
    }, HOLD_TO_ERASE_MS);
  });
  button.addEventListener("pointerup", endHold);
  button.addEventListener("pointercancel", endHold);
  // A finger that slid off the cell it started on never meant to hold it, and
  // a pointer that has begun a native drag is not holding one either.
  button.addEventListener("pointerleave", endHold);
  button.addEventListener("dragstart", endHold);
  button.addEventListener("click", () => {
    // The press that emptied the cell also cancels the click it would
    // otherwise have ended with: the two are different events on one button,
    // and this flag is the only thing they share.
    if (heldDown) {
      heldDown = false;
      return;
    }
    v.select(cell);
  });
}
