import type { FaultMark } from "./paint-fault.js";
import type { Selection } from "./selection.js";
import { currentWave, insertBeat, removeBeat, type Store } from "./state.js";

/**
 * The beat labels down the left of the map, and the two verbs a row carries.
 *
 * A label is a number that seeks, and nothing else. It grew a `+` and a `−`
 * on hover for a while — the owner asked for both on 13 September 2026,
 * having been making room in the middle of a wave by dragging every later
 * cell down one at a time — and then never found them, because two glyphs the
 * width of a digit inside a column of digits do not read as buttons. The
 * verbs are the line between the rows and the trash at the end of one now
 * (`grid-row-acts.ts`); what is left here is the edit.
 *
 * The edits themselves are `paint.ts`'s (`insertBeat`, `removeBeat`).
 */

export interface RowVerbs {
  insertRow(beat: number): void;
  /** Beats `from` to `to` inclusive, gone without a question. */
  removeRows(from: number, to: number): void;
}

/**
 * The two verbs, each marking the wave dirty and settling what an edit
 * touches, the way the cell verbs in `grid.ts` do. The selection follows the
 * cell it was on and is dropped with a removed row.
 *
 * **A removal is not asked about.** It was, for a row with anything on it,
 * and the owner took the question out on 25 September 2026 — the trash is
 * pressed on purpose, and a dialog per row made clearing a stretch of the
 * wave a dialog per row. Many rows go at once by dragging along the trash
 * instead (`grid-row-mark.ts`).
 */
export function bindRowVerbs(store: Store, selection: Selection, onEdit: () => void): RowVerbs {
  const insertRow = (beat: number): void => {
    const wave = currentWave(store);
    if (!wave) return;
    insertBeat(wave, beat);
    const at = selection.at();
    if (at && at.beat >= beat) selection.set({ beat: at.beat + 1, col: at.col });
    store.dirty = true;
    onEdit();
  };
  const removeRows = (from: number, to: number): void => {
    const wave = currentWave(store);
    if (!wave) return;
    removeBeat(wave, from, to);
    const at = selection.at();
    if (at && at.beat >= from && at.beat <= to) selection.set(null);
    else if (at && at.beat > to) selection.set({ beat: at.beat - (to - from + 1), col: at.col });
    store.dirty = true;
    onEdit();
  };
  return { insertRow, removeRows };
}

/** One beat's label: the number, which seeks. A `div` rather than a button
 * because the rail drawn over the row puts a button in it, and a button may
 * not hold buttons — `data-beat` stays here so `mark` lights the number with
 * its own row, and so the rail knows which row the pointer is on.
 *
 * **It also carries the row's malfunctions**, as two classes rather than as
 * anything drawn: `fault-in` on every row a placement holds over, `fault-at`
 * on the row it enters on. A fault is placed on a row and lasts a number of
 * rows (`fault-config.ts`), and until the map said so the pencil was one an
 * author could put down and then not find — the length they had just typed was
 * a number in a box with nothing on the map agreeing with it. The stripe down
 * the beat column *is* the window, and the title names what is in it. */
export function beatLabel(
  b: number,
  onSeek: (beat: number) => void,
  fault: FaultMark | undefined,
): HTMLElement {
  const label = document.createElement("div");
  label.className = "beat";
  if (fault?.holds) label.classList.add("fault-in");
  if (fault?.ends) label.classList.add("fault-end");
  if (fault?.enters.length) {
    label.classList.add("fault-at");
    label.title = fault.enters.map((f) => `${f.name} — enters on beat ${b}`).join("; ");
  }
  label.dataset.beat = String(b);
  const seek = document.createElement("button");
  seek.type = "button";
  seek.className = "seek";
  seek.textContent = String(b);
  seek.title = `Go to beat ${b}`;
  seek.addEventListener("click", () => onSeek(b));
  label.appendChild(seek);
  return label;
}
