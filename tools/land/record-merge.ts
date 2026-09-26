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
 * Each entry under the key it is followed by across the three sides: its
 * heading, and for a heading used again, which time it is.
 *
 * Keying by heading alone is what refused every merge of the ledger for a
 * day. `docs/time-log.md` carried "AUTO: the director plays a seat live, with
 * its finger drawn" twice on 25 September 2026 — one lane, landed in two
 * parts under one subject, two different bodies — and a map by heading has
 * room for only one of them, so the merge declined the whole file and every
 * landing that hour stopped on two plain appends at its other end. Before
 * that it was `docs/release-notes.md`, with `8995ded7` written twice word for
 * word from 19 September 2026.
 *
 * **The count runs from the oldest end**, the one nobody writes to: an entry
 * a side adds at its newest end is always the last of its heading, so it
 * never renumbers one already there, and a second body under an old heading
 * is a row added rather than a row overwritten.
 */
function keyed(entries: readonly Entry[], newest: Newest): Entry[] {
  const seen = new Map<string, number>();
  const oldestFirst = newest === "last" ? entries : [...entries].reverse();
  const out = oldestFirst.map((entry) => {
    const n = seen.get(entry.title) ?? 0;
    seen.set(entry.title, n + 1);
    return { title: n === 0 ? entry.title : `${entry.title}\u0000${n}`, block: entry.block };
  });
  return newest === "last" ? out : out.reverse();
}

function byTitle(entries: readonly Entry[]): Map<string, string> {
  return new Map(entries.map((entry) => [entry.title, entry.block]));
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
  const trunkEntries = keyed(trunkParts.entries, newest);
  const laneEntries = keyed(laneParts.entries, newest);

  const preamble = mergePreamble(baseParts.preamble, trunkParts.preamble, laneParts.preamble);
  if (preamble === null) return null;

  const baseAt = byTitle(keyed(baseParts.entries, newest));
  const trunkAt = byTitle(trunkEntries);
  const laneAt = byTitle(laneEntries);

  // An entry the lane no longer has is a record that lost a row, not a side
  // that decided something. Refuse, the way a session resolving this by hand
  // would stop and look — unless the row is still there word for word, which
  // is a copy of one note taken out rather than a note lost.
  const laneBlocks = new Set(laneAt.values());
  for (const [title, block] of baseAt) {
    if (!laneAt.has(title) && !laneBlocks.has(block)) return null;
  }

  const kept: Entry[] = [];
  for (const entry of trunkEntries) {
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
  for (const entry of laneEntries) {
    if (trunkAt.has(entry.title) || baseAt.has(entry.title)) continue;
    mine.push(entry);
  }
  const entries = newest === "first" ? [...mine, ...kept] : [...kept, ...mine];
  return join({ preamble, entries });
}
