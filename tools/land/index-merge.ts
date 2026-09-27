/**
 * Keeping a lane's own rows when `docs/INDEX.md` is resolved by regenerating it
 *
 * `docs/INDEX.md` is generated, so the rule for a conflict in it is already
 * written down: resolve a generated file by running its command. Take the
 * trunk's copy, run `bun run index`, and the table is right — every file the
 * lane added gets a row placed beside its siblings, every file it deleted loses
 * one, and none of it is a judgement anybody has to make.
 *
 * All of it except the words. A row's text is hand-written after the generator
 * puts the row there, and a lane that added a file and then wrote its line has
 * done work the tree cannot say back: regenerating from the trunk's copy
 * replaces it with the first sentence of the file's header comment, silently
 * and plausibly. So the regeneration is followed by this — the lane's own rows,
 * put back over the generated ones.
 *
 * It refuses in the one case where refusing is right: a row both sides rewrote
 * differently is a disagreement about a sentence, and no rule here can settle
 * it.
 *
 * **And a table that names one file twice is refused wherever it turns up.**
 * `48ad4d936` reached `origin/main` on 26 September 2026 with two rows for
 * `boss-cue-read-zg.ts`, one saying THE RIME and one THE TRIVET, and the drift
 * test went red for every lane after it. The lane had written its page as
 * `zg`, THE RIME had landed a `zg` meanwhile, and the rebase was settled by
 * hand with both rows kept. Two rows for one path are two sentences for one
 * file, which is the disagreement above, so `namedTwice` is asked of the
 * resolver's own output, of every replay's result (`replay.ts`) and of the
 * trunk before `bun run push` sends it (`push.ts`).
 */

import { parseRows } from "../index/index.js";

function lines(md: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of parseRows(md)) map.set(row.path, row.line);
  return map;
}

/**
 * The generated table with this lane's own row text written back into it, or
 * `null` when a row was rewritten on both sides.
 *
 * `base` is what the lane branched from and `trunk` what it is landing onto —
 * between them they say which side authored a line. A row absent from `base` is
 * one the lane filed; a row whose text moved on one side only takes that side's
 * words; a row the trunk never had is not put back at all, because the
 * regeneration has already decided whether the file it names still exists.
 */
export function keepLaneRows(
  base: string,
  trunk: string,
  lane: string,
  generated: string,
): string | null {
  const wasAt = lines(base);
  const trunkAt = lines(trunk);
  const laneAt = lines(lane);
  const madeAt = lines(generated);

  if (namedTwice(generated).length > 0) return null;
  let out = generated;
  for (const [path, mine] of laneAt) {
    const was = wasAt.get(path);
    if (mine === was) continue; // the lane did not touch this row
    const theirs = trunkAt.get(path);
    if (theirs !== undefined && theirs !== was && theirs !== mine) return null;
    const made = madeAt.get(path);
    if (made === undefined || made === mine) continue;
    out = out.replace(made, mine);
  }
  return out;
}

/** Every path the table gives more than one row to, in the order it first names them. */
export function namedTwice(md: string): string[] {
  const seen = new Set<string>();
  const twice = new Set<string>();
  for (const row of parseRows(md)) {
    if (seen.has(row.path)) twice.add(row.path);
    seen.add(row.path);
  }
  return [...twice];
}

/** The refusal for a table that names a file twice, or `null` when it names each once. */
export function namedTwiceSaid(md: string, where: string): string | null {
  const twice = namedTwice(md);
  if (twice.length === 0) return null;
  return `${where}'s docs/INDEX.md has two rows for ${twice.join(", ")}; keep the true one and run bun run index`;
}
