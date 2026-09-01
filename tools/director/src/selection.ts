/**
 * Which cell of the map is under the cursor's attention — one beat and one
 * column, or nothing.
 *
 * Its own module rather than a field on `Store` because it is not part of what
 * a wave *is*: the serializer on the server never sees it, a save does not
 * carry it, and switching waves throws it away. `state.ts` owns the wave;
 * this owns where the author is currently looking.
 *
 * **It exists because a click stopped deleting.** Painting the brush that is
 * already in a cell used to remove it, which made the brush its own eraser and
 * cost no trip to the palette. It also made the commonest gesture in the tool —
 * clicking a cell to look at what is in it — destructive, and there was no way
 * to point at an entry without either changing it or taking it away. Now a
 * click selects, `Delete` and `Backspace` remove, and a press held down does
 * the same where there is no keyboard (`grid.ts`).
 *
 * The watchers are how the panel under the map keeps up without the grid
 * knowing the panel exists — the same one-way arrangement `sim` and `render`
 * have, at a much smaller scale.
 */
export interface Cell {
  beat: number;
  col: number;
}

export interface Selection {
  /** The selected cell, or null when nothing is. */
  at(): Cell | null;
  /** Select a cell, or clear with null. Notifies only on a real change. */
  set(cell: Cell | null): void;
  /** Run `fn` whenever the selection changes. Never unsubscribed — the
   * director builds its panels once and lives until the tab closes. */
  watch(fn: () => void): void;
}

export function sameCell(a: Cell | null, b: Cell | null): boolean {
  if (!a || !b) return a === b;
  return a.beat === b.beat && a.col === b.col;
}

export function makeSelection(): Selection {
  let cell: Cell | null = null;
  const watchers: (() => void)[] = [];
  return {
    at: () => cell,
    set: (next) => {
      // Guarded so that re-selecting the cell already selected — which is what
      // painting over an entry does on every stroke — does not rebuild the
      // panel under the map and blur an input somebody is typing in.
      if (sameCell(cell, next)) return;
      cell = next ? { beat: next.beat, col: next.col } : null;
      for (const fn of watchers) fn();
    },
    watch: (fn) => {
      watchers.push(fn);
    },
  };
}
