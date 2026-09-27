import { type Snapshot, titles } from "./queue-guard.js";

/**
 * **An entry this lane took out that the trunk had already taken out.**
 *
 * The refusal in `queue-guard.ts` is for the opposite road — a landing putting
 * back what the trunk finished. This is the one where both sides finished it:
 * a claim is a commit on `origin/main`, a session working from a trunk it had
 * not fetched never saw it, and on 26 September 2026 THE CYST was built on the
 * owner's machine while a cloud session had it half done. Nothing conflicts —
 * both copies of `docs/queue.md` agree the entry is gone — so the landing is
 * not refused, only told, with the commit that got there first.
 */
export function doneTwice(base: string, trunk: string, lane: string): string[] {
  const onTrunk = new Set(titles(trunk));
  const inLane = new Set(titles(lane));
  return titles(base).filter((title) => !onTrunk.has(title) && !inLane.has(title));
}

/** The warning, one line per entry, with the commit the trunk took it out in. */
export function doneTwiceLines(file: string, found: readonly { title: string; by: string }[]) {
  return found.map(
    ({ title, by }) =>
      `  ⚑ ${file}: "${title}" was already done on the trunk by ${by || "a commit"}`,
  );
}

/**
 * Every such entry across the snapshots, said with the trunk's commit that
 * took it out. `run` is `git` in the lane's tree; the lane's own copy is its
 * `HEAD`, read before the replay rewrites it.
 */
export async function doneTwiceSaid(
  snapshots: readonly Snapshot[],
  mergeBase: string,
  trunk: string,
  run: (args: string[]) => Promise<string>,
): Promise<string[]> {
  const lines: string[] = [];
  for (const shot of snapshots) {
    const lane = await run(["show", `HEAD:${shot.file}`]);
    const found = [];
    for (const title of doneTwice(shot.base, shot.trunk, lane)) {
      const range = `${mergeBase}..${trunk}`;
      const by = await run([
        "log",
        "-1",
        "--format=%h %s",
        "-S",
        `## ${title}`,
        range,
        "--",
        shot.file,
      ]);
      found.push({ title, by });
    }
    lines.push(...doneTwiceLines(shot.file, found));
  }
  return lines;
}
