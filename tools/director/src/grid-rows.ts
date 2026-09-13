import type { Selection } from "./selection.js";
import { currentWave, insertBeat, onBeat, removeBeat, type Store } from "./state.js";

/**
 * The beat labels down the left of the map, and the two verbs they carry.
 *
 * A label was a number that seeks. It is still that, and on hover it grows
 * two glyphs: `+` opens an empty beat at this row and moves every later row a
 * beat later; `−` takes this row out and moves every later row a beat
 * earlier. The owner asked for both on 13 September 2026, having been making
 * room in the middle of a wave by dragging every later cell down one at a
 * time. The edits themselves are `paint.ts`'s (`insertBeat`, `removeBeat`);
 * this is the DOM and the asking.
 *
 * Kept for hover (`director-map.css`) so the column of numbers stays a column
 * of numbers, and a `div` rather than a button because a button may not hold
 * buttons — `data-beat` stays on the label so `mark` lights it with its row.
 */

/** The label column: room for the number and, on hover, the two glyphs. */
export const BEAT_LABEL_PX = 56;

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

/** One beat's label: the glyphs, then the number that seeks. */
export function beatLabel(b: number, verbs: RowVerbs, onSeek: (beat: number) => void): HTMLElement {
  const label = document.createElement("div");
  label.className = "beat";
  label.dataset.beat = String(b);
  const rows = document.createElement("span");
  rows.className = "rows";
  rows.appendChild(
    glyph("ins", "+", `Add an empty beat here. Beat ${b} and every row below move down one.`, () =>
      verbs.insertRow(b),
    ),
  );
  rows.appendChild(
    glyph("del", "−", `Remove beat ${b}. Every row below moves up one.`, () => verbs.removeRow(b)),
  );
  label.appendChild(rows);
  label.appendChild(glyph("seek", String(b), `Go to beat ${b}`, () => onSeek(b)));
  return label;
}

/** One small button on a beat label; `title` is what a hover says, in plain words. */
function glyph(cls: string, text: string, title: string, onClick: () => void): HTMLElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = cls;
  button.textContent = text;
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}
