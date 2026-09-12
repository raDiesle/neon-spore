/**
 * The row a slot has in the director's `SLOT_POSE` map, taken out with the
 * slot.
 *
 * `tools/director/src/versus-pose.ts` says which pose puts a slot's own
 * subject on the frame, one row a slot. Its header always said a decided
 * slot's row goes with its candidates, and nothing did it: by 10 September
 * 2026 the map carried a row for every slot that had ever closed — twice as
 * many rows as open slots — and no test compared the two. So `adopt` and
 * `drop` call this, and `tools/director/test/versus-pose.test.ts` refuses a
 * row whose slot has no candidate, which is what keeps it from growing back.
 *
 * A line-level edit rather than a parse and a reprint, for the reason
 * `tools/queue/edit.ts` gives: the file is hand-written rows, and the test
 * that reads the literal wants every other character where it was.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const POSE_MAP = join("tools", "director", "src", "versus-pose.ts");

/** The source with the slot's row gone, or unchanged when it had none. */
export function withoutPoseRow(source: string, slot: string): string {
  const row = new RegExp(
    `^ {2}${JSON.stringify(slot).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}: ".*",\\n`,
    "m",
  );
  const out = source.replace(row, "");
  // The last row gone leaves `{\n}`, and the formatter wants `{}` — the state
  // the map reached on 12 September 2026, when the last open slot was decided.
  return out.replace(/(const SLOT_POSE: Record<string, string> = \{)\n\};/, "$1};");
}

/** Take the slot's row out of the map on disk, and say whether there was one. */
export function removePoseRow(root: string, slot: string): string {
  const path = join(root, POSE_MAP);
  const was = readFileSync(path, "utf8");
  const now = withoutPoseRow(was, slot);
  if (now === was) return `  no row   ${POSE_MAP} never named ${slot}`;
  writeFileSync(path, now);
  return `  removed  ${POSE_MAP} — the ${slot} row`;
}
