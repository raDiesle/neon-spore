/**
 * Merging `docs/time-log.md` when a lane and the trunk both wrote an entry
 *
 * `replay.ts` settles two conflicts nobody authored — `docs/queue.md`, because
 * one tool wrote both sides, and `docs/INDEX.md`, because it is generated. The
 * ledger is the third and it was left out: **every lane appends an entry to it
 * in its landing commit** (`CLAUDE.md`), so two lanes landing the same hour
 * conflict on the same last lines with nothing to disagree about. It cost 65
 * friction minutes over four lanes in the ledger's own count, and twice on 16
 * September 2026 in one session, resolved by hand both times.
 *
 * **A record is not a list, and that is the whole difference from
 * `queue-merge.ts`.** A queue entry is meant to be removed — `bun run queue
 * done` is what removes it — so that merge drops what a lane dropped. Here
 * nothing is ever dropped: the file is append-only and read as a record, and a
 * lane that appears to have removed somebody's entry has not made a decision,
 * it has lost one. That case refuses and the landing stops, which is the same
 * answer a session should reach by hand.
 *
 * What it will settle is the only thing that actually happens: the trunk grew
 * entries this lane never saw, the lane wrote one of its own, and both were
 * appended at the end. Trunk order first, the lane's own entry after it.
 *
 * The parser is `queue-merge.ts`'s, imported rather than copied — one `##`
 * block per entry is the same shape in both files, and a second copy of it
 * would be a second thing to fix when a heading gains a rule.
 */

import { type Entry, join, split } from "./queue-merge.js";

/** The record the replay resolves. One file, named where the resolver reads it. */
export const LEDGER_FILE = "docs/time-log.md";

/**
 * Entries by heading, or `null` when one heading is used twice.
 *
 * Keying by title is what lets an entry be followed across three sides that
 * each appended to the end. It is also the assumption that would lose an entry
 * if it were wrong, so it is checked rather than trusted: all 310 headings in
 * the file on 16 September 2026 are unique, and a lane that writes a duplicate
 * gets a refusal instead of a silent overwrite.
 */
function byTitle(entries: readonly Entry[]): Map<string, string> | null {
  const map = new Map<string, string>();
  for (const entry of entries) {
    if (map.has(entry.title)) return null;
    map.set(entry.title, entry.block);
  }
  return map;
}

/**
 * The preamble, which is prose and is nobody's to merge.
 *
 * Whichever side changed it wins when only one did; both changing it the same
 * way is agreement; both changing it differently is a real disagreement and
 * the landing should stop. Identical to the queue's rule, and deliberately so
 * — the preamble is the part of both files that is written by hand for a
 * reader rather than appended by a tool.
 */
function mergePreamble(base: string, trunk: string, lane: string): string | null {
  if (lane === base) return trunk;
  if (trunk === base) return lane;
  if (lane === trunk) return trunk;
  return null;
}

/**
 * The three-way merge of the ledger, or `null` to let the landing stop.
 *
 * `base` is what the lane branched from, `trunk` what it is landing onto,
 * `lane` what it wrote.
 */
export function mergeLedger(base: string, trunk: string, lane: string): string | null {
  const baseParts = split(base);
  const trunkParts = split(trunk);
  const laneParts = split(lane);

  const preamble = mergePreamble(baseParts.preamble, trunkParts.preamble, laneParts.preamble);
  if (preamble === null) return null;

  const baseAt = byTitle(baseParts.entries);
  const trunkAt = byTitle(trunkParts.entries);
  const laneAt = byTitle(laneParts.entries);
  if (baseAt === null || trunkAt === null || laneAt === null) return null;

  // An entry the lane no longer has is a record that lost a row, not a lane
  // that decided something. Refuse, the way a session resolving this by hand
  // would stop and look.
  for (const title of baseAt.keys()) {
    if (!laneAt.has(title)) return null;
  }

  const merged: Entry[] = [];
  for (const entry of trunkParts.entries) {
    const mine = laneAt.get(entry.title);
    if (mine === undefined || mine === entry.block) {
      merged.push(entry);
      continue;
    }
    const was = baseAt.get(entry.title);
    // Both sides filed an entry under one heading, with different bodies.
    if (was === undefined) return null;
    if (entry.block === was) merged.push({ title: entry.title, block: mine });
    else if (mine === was) merged.push(entry);
    else return null; // both rewrote the same entry
  }
  // The lane's own entry, which is the one this whole file exists for, and any
  // other it appended — after everything the trunk already had.
  for (const entry of laneParts.entries) {
    if (trunkAt.has(entry.title) || baseAt.has(entry.title)) continue;
    merged.push(entry);
  }
  return join({ preamble, entries: merged });
}
