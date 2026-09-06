import type { WaveEntry } from "@neon-spore/content";
import { fenceGapsOf, GAP_COLS, toggleFenceGap } from "./entry-fields-fence.js";

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
