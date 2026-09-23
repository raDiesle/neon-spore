/**
 * **A row the generator wrote is the generator's to rewrite.** Split out of
 * `index.ts` on its line count: next door is what the table is, and this is
 * the one question of whether a surviving row's text may move.
 *
 * `generateIndex` keeps a surviving row byte for byte, because a third of the
 * table's rows are words a person chose over the header's first sentence, and
 * a regenerate that flattened them would throw those away. But the other two
 * thirds are the header's first sentence exactly, and keeping *those* byte for
 * byte meant a file whose header was rewritten went on being described by the
 * header it used to have: the lost screen's redesign, 22 September 2026, left
 * `lost-shut.ts` saying its cut was a vertical slot after the slot had gone,
 * and three rows were mended by hand.
 *
 * The line between the two kinds is drawn with the file as it was: a row whose
 * text is exactly what the generator derives from an *earlier* source was
 * never touched by a hand, and it follows the header. A row that says
 * anything else was written on purpose, and stays; `drift.ts` is what catches
 * that kind going wrong. Which earlier sources, and the one case they miss, is
 * `base.ts`'s to say.
 */

import { formatRow, type Row } from "./index.js";
import { deriveHeaderSentence } from "./sentence.js";

/** The text cell of a row, as `formatRow` wrote it. */
export function rowText(line: string): string {
  return line.replace(/^\|\s*`[^`]+`\s*\|\s?/, "").replace(/\s?\|$/, "");
}

/**
 * The row again, following its file's header when it was the header's own
 * sentence before — or the same row, when it was not or nothing changed.
 * `before` is the file's earlier sources, none for a file that did not change
 * or was not there.
 */
export function refreshRow(row: Row, now: () => string, before: readonly string[]): Row {
  const text = rowText(row.line);
  if (!before.some((source) => deriveHeaderSentence(source) === text)) return row;
  const next = deriveHeaderSentence(now());
  return next === text ? row : { path: row.path, line: formatRow(row.path, next) };
}
