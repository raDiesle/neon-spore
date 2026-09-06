import type { WaveEntry } from "@neon-spore/content";
import {
  cycleFenceCrack,
  fenceCrackAtCol,
  fenceCracksOf,
  fenceGapsOf,
  GAP_COLS,
  toggleFenceGap,
} from "./entry-fields-fence.js";

/**
 * THE FENCE's row under the map: one chip per column, lit where the wall is
 * open.
 *
 * **The one row here that is a set rather than a choice.** Every other row
 * `cell-config.ts` draws picks one value of a few — a speed, a side, a
 * length — so they all go through `choiceRow` and light exactly one chip. A
 * wall may be open in any number of columns, so its chips latch independently,
 * and folding it into `choiceRow` would have meant a "choice" that quietly
 * means something else in one caller.
 *
 * The chips are the seven columns a wave is authored in, in order, which is
 * also the order they appear on the map above — so a wall's opening is set by
 * pointing at the same place on the row as the cell it will be in.
 *
 * **And a second row under it for the cracks**, which is the same shape with
 * one more state in each chip. A crack is a column *and* an ammunition colour
 * — the only place a bolt opens a wall and the only bolt that opens it — so a
 * chip goes round dark, red, cyan and dark again rather than latching on and
 * off, and the colour it is showing is the colour the trigger has to be. The
 * owner asked for both halves in one sentence: *let me configure where and how
 * many cracks in which colour there are, for any kind of fence, and for a
 * fence without gaps let me place the number of cracks and where, up to the
 * maximum available.*
 *
 * The row says how many there are as well as where, because a wall's cracks
 * are a *budget* in a way its gaps are not: a solid wall with four of them is
 * four ways through the pair may choose between, and the count is the thing an
 * author is really setting.
 */
export function fenceGapsRow(
  entry: WaveEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
): HTMLElement {
  const open = new Set(fenceGapsOf(entry));
  const row = labelled("GAPS");
  for (const col of GAP_COLS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = open.has(col) ? "chip on" : "chip";
    button.textContent = String(col);
    button.addEventListener("click", () => {
      toggleFenceGap(entry, col);
      onEdit();
    });
    row.appendChild(button);
  }
  return row;
}

/**
 * The cracks, one chip per column, cycling dark → red → cyan → dark.
 *
 * The label carries the count, so an author setting how *many* a wall has does
 * not have to read seven chips to find out. A solid wall with none at all is
 * given one by `queueFromWave`, in the cell it was painted in, and the label
 * says so rather than leaving the row looking like a wall nobody can pass.
 */
export function fenceCracksRow(
  entry: WaveEntry,
  onEdit: () => void,
  labelled: (label: string) => HTMLElement,
): HTMLElement {
  const cracks = fenceCracksOf(entry);
  const solid = fenceGapsOf(entry).length === 0;
  const label = cracks.length ? `CRACKS ${cracks.length}` : solid ? "CRACKS 1*" : "CRACKS";
  const row = labelled(label);
  for (const col of GAP_COLS) {
    const color = fenceCrackAtCol(entry, col);
    const button = document.createElement("button");
    button.type = "button";
    button.className = color ? `chip crack ${color}` : "chip";
    button.textContent = String(col);
    button.title = color
      ? `column ${col}: a ${color} bolt opens the wall here`
      : `column ${col}: no crack — click for red, again for cyan`;
    button.addEventListener("click", () => {
      cycleFenceCrack(entry, col);
      onEdit();
    });
    row.appendChild(button);
  }
  return row;
}
