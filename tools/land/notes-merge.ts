/**
 * Merging `docs/release-notes.md` when two trunks both moved
 *
 * This conflict is not between two lanes and the landing's replay never sees
 * it: `note-commit.ts` writes the entry **on the trunk, after the rebase**, so
 * it is only ever a conflict in the other rebase this repository does — the
 * local trunk against `origin/main`, when two sessions pushed
 * (`reconcile.ts`). Both sides prepended an entry under the same preamble, in
 * the same format, written by the same tool, and `git rebase` has no idea they
 * are agreeing.
 *
 * It happened three times on 16 September 2026, twice to one session and once
 * to another, and the resolution was identical every time: take origin's copy
 * whole, put this side's own entries back at the top. That is exactly what
 * `record-merge.ts` does with the ledger's order turned around — the file is
 * read newest-first and written at the top, so the entries this trunk carries
 * and origin has never seen go above the ones it already had.
 *
 * Nothing is ever dropped here, the same as the ledger: an entry missing from
 * a side is a record that lost a row, and the merge refuses rather than decide
 * what happened to it.
 */

import { mergeRecord } from "./record-merge.js";

/** The record `reconcile.ts` resolves, named where the resolver reads it. */
export const NOTES_FILE = "docs/release-notes.md";

/**
 * The three-way merge of the release notes, or `null` to let the caller stop.
 *
 * `base` is what the two trunks last agreed on, `trunk` what is being replayed
 * onto — `origin/main` — and `lane` what this side wrote.
 */
export function mergeNotes(base: string, trunk: string, lane: string): string | null {
  return mergeRecord(base, trunk, lane, "first");
}
