import { AUTHORED_COLS, mapCol } from "@neon-spore/content";
import type { PressSpec } from "./spec.js";

/**
 * **What a column in `--press` actually points at, said out loud.**
 *
 * `press-plan.ts`'s file, one rule along, and its header is the precedent:
 * that one carries a rule invisible at the call site that cost a lane a
 * picture, and it is a pure function tested as one for exactly that reason.
 * This is the second rule of that kind, and it is the more expensive — eleven
 * lanes and 95 friction minutes in `docs/time-log.md` went on photographing
 * the wrong thing, and the ledger names this as the cause of one of them:
 * *a wave is authored in seven columns and played in eleven, so
 * `--press cannonCol=1` put the cannon under a column the gum was not in, and
 * three sheets showed a bolt sailing past a body it was never aimed at.*
 *
 * **A press names a field column; a wave file names an authored one.** The two
 * agree only on a seven-column field (`content/queue.ts`, `mapCol`), and
 * nothing anywhere said so at the moment the number was typed. `press.ts`'s
 * header has warned about it in prose since the day it was written, which is
 * the tell: a rule a person has to remember is a rule a tool should say.
 *
 * So this says it back. It does not *change* the press — the entry that asked
 * for this is explicit that the tool must not reach in and move anything, and
 * a caller who wants field column 1 is entitled to it. What they are not
 * entitled to is finding out from the picture.
 */

/**
 * The authored column that lands on this field column, or `null` when none
 * does.
 *
 * `null` is the interesting answer and the common one on a wide field: eleven
 * columns have seven authored numbers spread across them, so four of them are
 * places no wave can put a body. A press aimed at one of those is the exact
 * failure the ledger recorded, and it is worth a different sentence.
 *
 * The lowest match when several authored columns round to the same field
 * column, which happens on a field narrower than seven: what a reader wants is
 * *a* number they could have typed, and the first is the one they would find.
 */
export function authoredFor(col: number, cols: number): number | null {
  for (let authored = 0; authored < AUTHORED_COLS; authored++) {
    if (mapCol(authored, cols) === col) return authored;
  }
  return null;
}

/**
 * One line about one column, or `null` when there is nothing to warn about.
 *
 * Nothing is said on a seven-column field: there the two numbering systems are
 * the same one, and a line saying so on every capture is noise that teaches a
 * reader to skip the place the real warning will appear.
 */
export function columnNote(kind: string, col: number, cols: number): string | null {
  if (cols === AUTHORED_COLS) return null;
  const authored = authoredFor(col, cols);
  if (authored !== null) {
    return `${kind}=${col} — field column ${col} of ${cols}, where a wave's authored column ${authored} stands.`;
  }
  const lands = mapCol(col, cols);
  const what =
    col < AUTHORED_COLS ? ` A wave's authored column ${col} is field column ${lands}.` : "";
  return `${kind}=${col} — field column ${col} of ${cols}, and no authored column lands there.${what}`;
}

/** The two controls whose value is a column of the field. */
const COLUMN_PRESSES = new Set(["cannonCol", "shieldCol"]);

/**
 * Every line a run of presses is owed, in the order the presses were written.
 *
 * One per press rather than one per column: a capture that moves the cannon
 * twice is a capture where both numbers are worth reading, and de-duplicating
 * them would hide the second of two presses that disagree.
 */
export function columnNotes(presses: readonly PressSpec[], cols: number): string[] {
  const out: string[] = [];
  for (const press of presses) {
    const { kind, col } = press.command;
    if (!COLUMN_PRESSES.has(kind) || typeof col !== "number") continue;
    const said = columnNote(kind, col, cols);
    if (said !== null) out.push(said);
  }
  return out;
}
