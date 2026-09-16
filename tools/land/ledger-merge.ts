/**
 * Merging `docs/time-log.md` when two sides both wrote an entry
 *
 * `replay.ts` settles two conflicts nobody authored — `docs/queue.md`, because
 * one tool wrote both sides, and `docs/INDEX.md`, because it is generated. The
 * ledger is the third and it was left out: **every lane appends an entry to it
 * in its landing commit** (`CLAUDE.md`), so two lanes landing the same hour
 * conflict on the same last lines with nothing to disagree about. It cost 65
 * friction minutes over four lanes in the ledger's own count, and twice on 16
 * September 2026 in one session, resolved by hand both times.
 *
 * The merge itself is `record-merge.ts`, shared with the release notes since
 * 16 September 2026 — a record is a record and the two differ only in which
 * end is written to. This file is the ledger's half of that: its path, its
 * reading order, and the argument above for why it is merged at all.
 */

import { mergeRecord } from "./record-merge.js";

/** The record the replay resolves. One file, named where the resolver reads it. */
export const LEDGER_FILE = "docs/time-log.md";

/**
 * The three-way merge of the ledger, or `null` to let the landing stop.
 *
 * `base` is what the lane branched from, `trunk` what it is landing onto,
 * `lane` what it wrote. Trunk order first, the lane's own entry after it:
 * entries are appended here, so the end is where a new one belongs.
 */
export function mergeLedger(base: string, trunk: string, lane: string): string | null {
  return mergeRecord(base, trunk, lane, "last");
}
