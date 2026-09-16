import type { WaveEntry } from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";

/**
 * **One arrival and one pod, written back out** — the two lines of a wave
 * that grow by a field, not by a branch. Cut out of `serialize.ts` the way
 * the boss was (`serialize-boss.ts`): that file writes what a *wave* is, and
 * had one line left for the next thing an arrival can carry.
 */

/**
 * One arrival. The field order is the order `WaveEntry` declares them in, so a
 * hand-written wave and a saved one look the same.
 *
 * Every optional field is written only when it is there — a lure that takes the
 * body its colour names, or a rock at its ordinary width, says nothing — so
 * every wave written before any of them existed round-trips byte for byte.
 * Dropping one is the failure this shape exists to prevent: the editor reads a
 * `wears` in and writes it back out as nothing, which quietly re-authors the
 * wave. It has happened twice — `wears` and then `gaps` — so a new field on
 * `WaveEntry` needs a line here in the same commit, and `serialize.test.ts`
 * only proves the fields it knows about.
 */
export function serializeEntry(entry: WaveEntry): string {
  const parts: string[] = [];
  parts.push(`beat: ${entry.beat}`);
  parts.push(`col: ${entry.col}`);
  if (entry.kind !== undefined) {
    parts.push(`kind: "${entry.kind}"`);
  }
  parts.push(`color: ${entry.color === null ? "null" : `"${entry.color}"`}`);
  if (entry.wears !== undefined) parts.push(`wears: "${entry.wears}"`);
  if (entry.size !== undefined) parts.push(`size: ${entry.size}`);
  if (entry.path !== undefined) parts.push(`path: "${entry.path}"`);
  if (entry.beads !== undefined) parts.push(`beads: ${entry.beads}`);
  // How many beats a box asks for — dropped, a wave's own count would silently
  // become `cfg.beatboxBeats` on the first save.
  if (entry.beats !== undefined) parts.push(`beats: ${entry.beats}`);
  if (entry.segments !== undefined) parts.push(`segments: ${entry.segments}`);
  if (entry.side !== undefined) parts.push(`side: "${entry.side}"`);
  // **THE FENCE's gaps, and an empty list is not nothing.** Absent means *the
  // column this was painted in* (`queueFromWave`) and `[]` means a wall with no
  // way through at all, which is a decision an author makes and the only wall
  // the cannon can cut — so the two must not collapse into each other here.
  // This row was missing until the day somebody hand-authored a solid fence and
  // found `bun test` had quietly taken it out again: the GAPS panel
  // (`cell-config-gaps.ts`) has written `entry.gaps` since THE FENCE shipped,
  // and every save dropped it. That is `wears`'s own failure said twice, which
  // is what the note above this function is for.
  if (entry.gaps !== undefined) parts.push(`gaps: [${entry.gaps.join(", ")}]`);
  // And where it is cracked, one list per ammunition colour. Absent is the only
  // "nothing" these two have — a wall with no cracks and no gaps is given one
  // by `queueFromWave` — so unlike `gaps` there is no empty list to preserve,
  // and `cycleFenceCrack` never writes one.
  if (entry.cracksRed !== undefined) parts.push(`cracksRed: [${entry.cracksRed.join(", ")}]`);
  if (entry.cracksCyan !== undefined) parts.push(`cracksCyan: [${entry.cracksCyan.join(", ")}]`);
  // Which way a rock crosses the field, and the row it crosses along. Written
  // only when the author set them, so every rock that falls comes back out of
  // the editor as the three fields it went in with — the rule the paragraph
  // above this function is about, and the one `wears` and `gaps` were each
  // lost to once.
  if (entry.cross !== undefined) parts.push(`cross: ${entry.cross}`);
  if (entry.row !== undefined) parts.push(`row: ${entry.row}`);
  // And which seat a mine is drawn to — dropped, a wave that handed the tile
  // to the pilot would hand it back to the navigator on the first save, which
  // is `wears` and `gaps` a third time.
  if (entry.sees !== undefined) parts.push(`sees: ${entry.sees}`);
  return `{ ${parts.join(", ")} }`;
}

export function serializePod(pod: PodEntry): string {
  const parts = [`beat: ${pod.beat}`, `col: ${pod.col}`, `row: ${pod.row}`];
  if (pod.kind !== undefined) parts.push(`kind: "${pod.kind}"`);
  // Every one of these is written only when the author set it, and that is the
  // whole of why a pod that hangs where it was left comes back out of the
  // editor as the same three fields it went in with — a saved `cross: 0` or
  // `cross: 0` would be a wave file that changed the day somebody opened it.
  if (pod.cross !== undefined) parts.push(`cross: ${pod.cross}`);
  if (pod.speed !== undefined) parts.push(`speed: ${pod.speed}`);
  return `{ ${parts.join(", ")} }`;
}
