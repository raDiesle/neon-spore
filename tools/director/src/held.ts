import type { Brush } from "./brushes.js";
import type { Cell } from "./selection.js";

/**
 * **What the author is carrying**: the brush that is armed, and — while a drag
 * is in the air — the thing being dragged.
 *
 * The palette used to hold nothing at all. A brush click painted whatever cell
 * was selected and the button went dark again, so the order was always *tile
 * first, brush second* and there was no state to draw. The owner asked for the
 * other order as well: **click a brush and it stays lit, because the next
 * click is on the map**. That is one piece of state two panels have to agree
 * about — the palette lights it, the grid spends it — and neither may own it,
 * for `selection.ts`'s reason exactly.
 *
 * It is not part of what a wave *is*, either: the serializer never sees it, a
 * save does not carry it, and it survives switching waves because a brush is
 * about the author rather than about the wave.
 *
 * **The drag is here too**, and in the same module on purpose. A drag is the
 * same question asked with the pointer held down — *what am I carrying, and
 * where will it land* — and the two are mutually exclusive by construction: a
 * cell being dragged is a cell whose contents are moving, and an armed brush
 * turns the map into a surface that paints rather than one that rearranges.
 * Keeping them apart would be two modules that have to be read together.
 *
 * The payload is a value here rather than in `DataTransfer` because both ends
 * of every drag are in this one document. `getData` is unreadable during
 * `dragover` — which is exactly where the drop target has to decide whether it
 * wants the thing — so a `DataTransfer`-only design has to encode the answer
 * in the MIME type and read it back out of `types`. This is the same fact,
 * said once.
 */

/** What a drag is carrying: a brush out of the palette, or the contents of a
 * cell on its way to another cell. */
export type Carrying = { kind: "brush"; brush: Brush } | { kind: "cell"; from: Cell };

export interface Held {
  /** The armed brush, or null when the map only selects. */
  brush(): Brush | null;
  /** Arm a brush, or disarm with null. Notifies only on a real change. */
  hold(brush: Brush | null): void;
  /** Run `fn` whenever the armed brush changes. Never unsubscribed — the
   * director builds its panels once and lives until the tab closes. */
  watch(fn: () => void): void;
  /** What the drag in the air is carrying, or null when none is. */
  dragging(): Carrying | null;
  /** Start or end a drag. Silent: nothing is redrawn by a drag beginning, and
   * a watcher here would rebuild the grid out from under the drop target. */
  drag(carrying: Carrying | null): void;
}

export function makeHeld(): Held {
  let brush: Brush | null = null;
  let carrying: Carrying | null = null;
  const watchers: (() => void)[] = [];
  return {
    brush: () => brush,
    hold: (next) => {
      if (brush === next) return;
      brush = next;
      for (const fn of watchers) fn();
    },
    watch: (fn) => {
      watchers.push(fn);
    },
    dragging: () => carrying,
    drag: (next) => {
      carrying = next;
    },
  };
}
