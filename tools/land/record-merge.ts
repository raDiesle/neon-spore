/**
 * Merging a **record**: a file of `##` entries that one tool appends to and
 * nobody ever edits, which two sides wrote to at the same end.
 *
 * This is `ledger-merge.ts`'s merge, taken out of it on 16 September 2026 when
 * a second record needed the same one. There are two of them now and they are
 * the same shape from opposite ends:
 *
 * - **`docs/time-log.md`**, appended to — every lane writes its entry at the
 *   end in its landing commit, so two lanes landing the same hour conflict on
 *   the same last lines with nothing to disagree about.
 * - **`docs/release-notes.md`**, prepended to — `note-commit.ts` writes an
 *   entry at the top the moment `main` moves, so two trunks that both moved
 *   conflict on the same first lines for the same reason.
 *
 * **Nothing is ever dropped, and that is the whole difference from
 * `queue-merge.ts`.** A queue entry is meant to be removed — `bun run queue
 * done` is what removes it — so that merge drops what a side dropped. Here a
 * side that appears to have removed somebody's entry has not made a decision,
 * it has lost one: that refuses and the caller stops, which is the same answer
 * a session should reach by hand.
 *
 * The parser is `queue-merge.ts`'s, imported rather than copied — one `##`
 * block per entry is the same shape in all three files, and a second copy of
 * it would be a second thing to fix when a heading gains a rule.
 */

import { type Entry, join, split } from "./queue-merge.js";

/**
 * Which end a side's own new entries belong at, which is the only thing that
 * differs between the two records this merges. It is the record's own reading
 * order: the ledger is read oldest-first and written at the end, the release
 * notes newest-first and written at the top.
 */
export type Newest = "first" | "last";

/**
 * Entries by heading, or `null` when one heading is used twice **and the two
 * say different things**.
 *
 * Keying by title is what lets an entry be followed across three sides that
 * each wrote to the same end. It is also the assumption that would lose an
 * entry if it were wrong, so it is checked rather than trusted: a release
 * note's heading carries its own sha, a ledger heading its own date and lane,
 * and a side that files two different bodies under one of those gets a refusal
 * instead of a silent overwrite.
 *
 * **A heading repeated with byte-identical text is not that.** It is one note
 * written twice, which `docs/release-notes.md` carried from 19 September 2026:
 * `8995ded7` appears in it twice, word for word, and every `bun run reconcile`
 * from then on refused the whole file over a pair of blocks that agree
 * perfectly. There is nothing to decide between two copies of one sentence, so
 * the second is passed over and the record merges. `notes.ts` is where the
 * double write itself is stopped.
 */
function byTitle(entries: readonly Entry[]): Map<string, string> | null {
  const map = new Map<string, string>();
  for (const entry of entries) {
    const seen = map.get(entry.title);
    if (seen !== undefined) {
      if (seen !== entry.block) return null;
      continue;
    }
    map.set(entry.title, entry.block);
  }
  return map;
}

/**
 * The preamble, which is prose and is nobody's to merge.
 *
 * Whichever side changed it wins when only one did; both changing it the same
 * way is agreement; both changing it differently is a real disagreement and
 * the caller should stop. Identical to the queue's rule, and deliberately so —
 * the preamble is the part of all three files that is written by hand for a
 * reader rather than appended by a tool.
 */
function mergePreamble(base: string, trunk: string, lane: string): string | null {
  if (lane === base) return trunk;
  if (trunk === base) return lane;
  if (lane === trunk) return trunk;
  return null;
}

/**
 * The three-way merge of a record, or `null` to let the caller stop.
 *
 * `base` is what the side branched from, `trunk` what it is replaying onto,
 * `lane` what it wrote. The names are the rebase's: in a landing the lane is a
 * branch and the trunk is `main`, and in `reconcile.ts` the lane is the local
 * trunk and the trunk is `origin/main` — the same three sides either way.
 */
export function mergeRecord(
  base: string,
  trunk: string,
  lane: string,
  newest: Newest,
): string | null {
  const baseParts = split(base);
  const trunkParts = split(trunk);
  const laneParts = split(lane);

  const preamble = mergePreamble(baseParts.preamble, trunkParts.preamble, laneParts.preamble);
  if (preamble === null) return null;

  const baseAt = byTitle(baseParts.entries);
  const trunkAt = byTitle(trunkParts.entries);
  const laneAt = byTitle(laneParts.entries);
  if (baseAt === null || trunkAt === null || laneAt === null) return null;

  // An entry the lane no longer has is a record that lost a row, not a side
  // that decided something. Refuse, the way a session resolving this by hand
  // would stop and look.
  for (const title of baseAt.keys()) {
    if (!laneAt.has(title)) return null;
  }

  const kept: Entry[] = [];
  for (const entry of trunkParts.entries) {
    const mine = laneAt.get(entry.title);
    if (mine === undefined || mine === entry.block) {
      kept.push(entry);
      continue;
    }
    const was = baseAt.get(entry.title);
    // Both sides filed an entry under one heading, with different bodies.
    if (was === undefined) return null;
    if (entry.block === was) kept.push({ title: entry.title, block: mine });
    else if (mine === was) kept.push(entry);
    else return null; // both rewrote the same entry
  }
  // What this side wrote, which is what the whole merge exists for.
  const mine: Entry[] = [];
  for (const entry of laneParts.entries) {
    if (trunkAt.has(entry.title) || baseAt.has(entry.title)) continue;
    mine.push(entry);
  }
  const entries = newest === "first" ? [...mine, ...kept] : [...kept, ...mine];
  return join({ preamble, entries });
}
