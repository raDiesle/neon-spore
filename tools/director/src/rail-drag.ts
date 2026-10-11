import type { DropZone } from "./rail-groups.js";
import type { Store } from "./state.js";

/**
 * A WAVE DRAGGED TO A NEW PLACE IN THE LIST.
 *
 * The owner, 28 September 2026: *"in director, I want drag and drop in wave
 * list so i can change order of waves."* The ↑ and ↓ over the column moved a
 * wave one place a press, which is forty presses to carry a wave across an
 * act; a drag is one.
 *
 * **Where on the row it is let go says what happens** (`dropWave` in
 * `rail-groups.ts`): on its upper or lower quarter the wave goes between two
 * rows, and on its middle it goes *into* the row, as a child of it — the
 * owner's grouping, 11 October 2026. The stylesheet draws a line on the edge,
 * or a frame round the whole row, before the drop. Where a browser hands no
 * pointer height, the edge is the one the wave came from.
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
export function rowDrag(drop: (from: number, to: number, zone: DropZone) => void): RowDrag {
  let from: number | null = null;
  const clear = (row: HTMLElement): void => {
    row.classList.remove("drop-before");
    row.classList.remove("drop-after");
    row.classList.remove("drop-into");
  };
  const zoneOf = (row: HTMLElement, i: number, e: DragEvent): DropZone => {
    const box = row.getBoundingClientRect?.();
    if (!box?.height || typeof e.clientY !== "number") return (from ?? i) > i ? "before" : "after";
    const at = (e.clientY - box.top) / box.height;
    return at < 0.25 ? "before" : at > 0.75 ? "after" : "into";
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
        const zone = from === i ? null : zoneOf(row, i, e);
        row.classList.toggle("drop-before", zone === "before");
        row.classList.toggle("drop-after", zone === "after");
        row.classList.toggle("drop-into", zone === "into");
      });
      row.addEventListener("dragleave", () => clear(row));
      row.addEventListener("drop", (e) => {
        clear(row);
        if (from === null) return;
        e.preventDefault();
        const moved = from;
        const zone = zoneOf(row, i, e);
        from = null;
        if (moved !== i) drop(moved, i, zone);
      });
    },
  };
}
