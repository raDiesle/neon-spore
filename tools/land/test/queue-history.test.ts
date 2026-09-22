import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { everHeldIn, queueSnapshots, resurrectedAfter } from "../queue-guard.js";
import { replay } from "../replay.js";

/**
 * **The resurrection the three snapshots cannot see, driven through real git.**
 *
 * `5780141b` put *A landing that forgot `--unverified` has no way to write the
 * entry afterwards* back into `docs/queue.md` on 19 September 2026, word for
 * word and `Taken:` line and all, twelve commits after `6db42a92` had removed
 * it — with the guard running over that landing and saying nothing, while the
 * same commit dropped two other finished entries correctly.
 *
 * The shape is reproduced here rather than reasoned about: the trunk removes
 * an entry, a lane branches from the trunk **after** that removal, and the
 * lane's own commit carries the entry back — a stale copy of the file, which
 * is the one thing a lane can hold that nothing on the trunk contradicts.
 *
 * The merge is not what went wrong and is not on trial here
 * (`queue-merge.test.ts` holds that, including the three-out-of-four shape of
 * this very commit); the replay below does not even conflict. What is on trial
 * is the **window**: `base` is the merge base, so a removal older than the
 * branch point is in none of the three snapshots, and the re-add is
 * indistinguishable from a filing until somebody asks the trunk's history.
 *
 * The second test is the other half of that, and the reason the history is
 * asked about the `Found:` line as well as the heading: two lanes may honestly
 * file the same one-line finding, and the second of them must land.
 */

const PREAMBLE = "# Queue\n\nPreamble.\n";
const entry = (title: string, found = "2026-09-19, lane") =>
  `\n## ${title}\n\n- **Found:** ${found}\n\nWhat to do.\n`;
const file = (...titles: string[]) => PREAMBLE + titles.map((t) => entry(t)).join("");

const DONE = "A landing that forgot --unverified has no way to write the entry afterwards";
const WAITING = "An item nobody has taken";
const NEW = "Something this lane found on the way";

const WHO = {
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};

/** A repository whose trunk has finished one entry and still lists another,
 * with a lane branched off it *after* the removal — and the two snapshots a
 * landing would have read, taken before the replay, as the guard takes them. */
async function trunkThatFinishedOne(root: string, laneFile: string) {
  const run = (args: string[]) => gitIn(args, root, WHO);
  const write = (md: string) => writeFile(join(root, "docs", "queue.md"), md);

  await run(["init", "-b", "main"]);
  await run(["config", "user.email", "t@t"]);
  await run(["config", "user.name", "t"]);
  await Bun.write(join(root, "docs", "parked.md"), "# Parked\n");
  await write(file(DONE, WAITING));
  await run(["add", "-A"]);
  await run(["commit", "-m", "the queue, with both items waiting"]);

  // The trunk finishes one. This is 6db42a92.
  await write(file(WAITING));
  await run(["commit", "-am", "close the first item"]);

  // The lane branches *after* that, so the merge base has no copy of the
  // finished entry at all. This is 5780141b.
  await run(["checkout", "-b", "lane"]);
  await write(laneFile);
  await run(["commit", "-am", "what this lane wrote"]);

  const before = await queueSnapshots(
    "main",
    (rev, path) => gitIn(["show", `${rev}:${path}`], root, WHO),
    await run(["merge-base", "main", "HEAD"]),
  );
  expect(await replay(root, "main")).toMatchObject({ ok: true });
  return { before, asker: everHeldIn(run, "main") };
}

async function inRepo(body: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "queue-history-"));
  try {
    await body(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("an entry the trunk finished before the lane branched", () => {
  test(
    "is invisible to the snapshots and caught by the trunk's history",
    () =>
      inRepo(async (root) => {
        // The stale copy, carried back beside an entry the lane really filed.
        const { before, asker } = await trunkThatFinishedOne(root, file(DONE, WAITING, NEW));

        // The gap, stated as a fact rather than as a worry: the three
        // snapshots have nothing to say about an entry none of them holds.
        expect(await resurrectedAfter(root, before)).toEqual([]);

        // The trunk's own history does, and says it about that entry only —
        // the one the lane really filed has never been in the file before.
        expect(await resurrectedAfter(root, before, asker)).toEqual([
          { file: "docs/queue.md", titles: [DONE] },
        ]);
      }),
    repoTimeout(24),
  );

  test(
    "a second lane filing the same finding afresh is not refused",
    () =>
      inRepo(async (root) => {
        // The same heading, and a `Found:` line naming this lane and this day
        // — which is what a filing is and what a copy can never be.
        const refiled = PREAMBLE + entry(WAITING) + entry(DONE, "2026-09-22, another-lane");
        const { before, asker } = await trunkThatFinishedOne(root, refiled);

        expect(await resurrectedAfter(root, before, asker)).toEqual([]);
      }),
    repoTimeout(24),
  );
});
