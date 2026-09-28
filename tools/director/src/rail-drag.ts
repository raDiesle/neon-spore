import type { Store } from "./state.js";

/**
 * A WAVE DRAGGED TO A NEW PLACE IN THE LIST.
 *
 * The owner, 28 September 2026: *"in director, I want drag and drop in wave
 * list so i can change order of waves."* The ↑ and ↓ over the column moved a
 * wave one place a press, which is forty presses to carry a wave across an
 * act; a drag is one.
 *
 * **A row dropped on takes the dragged wave's place in the direction it came
 * from**: dragged down, the wave lands after the row it was let go on; dragged
 * up, before it. That is the arrangement a list with no gaps between its rows
 * needs, because it asks nothing of where in the row the pointer was — and the
 * line the stylesheet draws on the row's lower or upper edge says which it
 * will be before the drop.
 *
 * Which act file a wave ends up in is decided by the save, as it always was:
 * `writeWaves` cuts the flat list at each act's old length, so a wave carried
 * across a boundary is written into the act it now stands in.
 */

/**
 * Carries the wave at `from` to `to`, and keeps the wave that was open open —
 * the dragged one if it was that one, and otherwise whichever wave it was,
 * wherever the move pushed it. The ↑ and ↓ are this with a neighbour.
 */
export function moveWave(store: Store, from: number, to: number): void {
  const n = store.waves.length;
  if (from === to || from < 0 || to < 0 || from >= n || to >= n) return;
  const open = store.waves[store.index];
  const [wave] = store.waves.splice(from, 1);
  if (!wave) return;
  store.waves.splice(to, 0, wave);
  if (open) store.index = store.waves.indexOf(open);
}

export interface RowDrag {
  /** Makes one drawn row draggable and a place to drop, as wave `i`. */
  bind(row: HTMLElement, i: number): void;
}

/**
 * One per list, because the row a drag started on is gone by the time it is
 * dropped whenever the list redraws — and because a `dragover` may not read
 * what `dragstart` wrote into the transfer, so which wave is travelling is
 * kept here rather than in it.
 */
export function rowDrag(drop: (from: number, to: number) => void): RowDrag {
  let from: number | null = null;
  const clear = (row: HTMLElement): void => {
    row.classList.remove("drop-before");
    row.classList.remove("drop-after");
  };
  return {
    bind(row, i) {
      row.draggable = true;
      row.addEventListener("dragstart", (e) => {
        from = i;
        // Firefox starts no drag that carries nothing.
        e.dataTransfer?.setData("text/plain", String(i + 1));
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
        row.classList.add("dragging");
      });
      row.addEventListener("dragend", () => {
        from = null;
        row.classList.remove("dragging");
      });
      row.addEventListener("dragover", (e) => {
        // Not ours — a file, or text from another page — so not a drop target.
        if (from === null) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        row.classList.toggle("drop-before", from > i);
        row.classList.toggle("drop-after", from < i);
      });
      row.addEventListener("dragleave", () => clear(row));
      row.addEventListener("drop", (e) => {
        clear(row);
        if (from === null) return;
        e.preventDefault();
        const moved = from;
        from = null;
        if (moved !== i) drop(moved, i);
      });
    },
  };
}
