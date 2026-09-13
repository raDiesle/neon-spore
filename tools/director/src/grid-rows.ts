import type { Selection } from "./selection.js";
import { currentWave, insertBeat, onBeat, removeBeat, type Store } from "./state.js";

/**
 * The beat labels down the left of the map, and the two verbs a row carries.
 *
 * A label is a number that seeks, and nothing else. It grew a `+` and a `−`
 * on hover for a while — the owner asked for both on 13 September 2026,
 * having been making room in the middle of a wave by dragging every later
 * cell down one at a time — and then never found them, because two glyphs the
 * width of a digit inside a column of digits do not read as buttons. The
 * verbs are the line between the rows and the trash at the end of one now
 * (`grid-row-acts.ts`); what is left here is the asking and the edit.
 *
 * The edits themselves are `paint.ts`'s (`insertBeat`, `removeBeat`).
 */

export interface RowVerbs {
  insertRow(beat: number): void;
  removeRow(beat: number): void;
}

/**
 * The two verbs, each marking the wave dirty and settling what an edit
 * touches, the way the cell verbs in `grid.ts` do. The selection follows the
 * cell it was on and is dropped with a removed row. **A row with anything on
 * it is asked about first, in plain words** — the editor has no undo.
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
  const removeRow = (beat: number): void => {
    const wave = currentWave(store);
    if (!wave) return;
    const held = onBeat(wave, beat);
    if (held > 0) {
      const what = held === 1 ? "one thing" : `${held} things`;
      const ok = window.confirm(
        `Beat ${beat} has ${what} on it. Remove the beat and what is on it? Every row below moves up one beat.`,
      );
      if (!ok) return;
    }
    removeBeat(wave, beat);
    const at = selection.at();
    if (at && at.beat === beat) selection.set(null);
    else if (at && at.beat > beat) selection.set({ beat: at.beat - 1, col: at.col });
    store.dirty = true;
    onEdit();
  };
  return { insertRow, removeRow };
}

/** One beat's label: the number, which seeks. A `div` rather than a button
 * because the rail drawn over the row puts a button in it, and a button may
 * not hold buttons — `data-beat` stays here so `mark` lights the number with
 * its own row, and so the rail knows which row the pointer is on. */
export function beatLabel(b: number, onSeek: (beat: number) => void): HTMLElement {
  const label = document.createElement("div");
  label.className = "beat";
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
