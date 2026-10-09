import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { restoredIn, unrestored } from "../queue-guard.js";
import { replayGuarded } from "../replay-guarded.js";

/**
 * **A landing refused once is refused again.**
 *
 * On 8 October 2026 THE BLISTER's lanes 5 to 8 were put back into
 * `docs/queue.md` after the trunk had taken them out; the landing refused, and
 * the same command run a second time landed them. The first run had rebased
 * the lane, the second had nothing to replay, and the guard ran only inside
 * the replay. Here the second run is the one with `rebase` false — what
 * `run.ts` passes when the lane is no longer behind — and a `Restored:` line
 * in a commit is the way through that was meant.
 */

const PREAMBLE = "# Queue\n\nPreamble.\n";
const entry = (title: string) => `\n## ${title}\n\n- **Found:** 2026-10-08, lane\n\nWhat to do.\n`;
const file = (...titles: string[]) => PREAMBLE + titles.map(entry).join("");

const DONE = "THE BLISTER, lane 5: its SWIPE";
const WAITING = "An item nobody has taken";

const WHO = {
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};

/** A trunk that took `DONE` out, and a lane that branched before and puts it
 * back — behind the trunk by one commit, as the first run finds it. */
async function laneThatPutsOneBack(root: string) {
  const run = (args: string[]) => gitIn(args, root, WHO);
  const write = (name: string, md: string) => writeFile(join(root, name), md);
  await run(["init", "-b", "main"]);
  await run(["config", "user.email", "t@t"]);
  await run(["config", "user.name", "t"]);
  await Bun.write(join(root, "docs", "parked.md"), "# Parked\n");
  await write("docs/queue.md", file(DONE, WAITING));
  await run(["add", "-A"]);
  await run(["commit", "-m", "the queue"]);

  await run(["checkout", "-b", "lane"]);
  await write("work.txt", "the lane's work\n");
  await run(["add", "work.txt"]);
  await run(["commit", "-m", "the lane's work"]);

  await run(["checkout", "main"]);
  await write("docs/queue.md", file(WAITING));
  await run(["commit", "-am", `${DONE} — done`]);

  // The lane's stale copy, after the trunk's removal, so nothing conflicts.
  await run(["checkout", "lane"]);
  await run(["checkout", "main", "--", "docs/queue.md"]);
  await run(["commit", "-m", "the trunk's copy of the queue"]);
  await write("docs/queue.md", file(DONE, WAITING));
  await run(["commit", "-am", "put the entry back"]);
  return run;
}

async function inRepo(body: (root: string) => Promise<void>): Promise<void> {
  const root = await mkdtemp(join(tmpdir(), "rerun-refused-"));
  try {
    await body(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe("a landing the queue guard refused", () => {
  test(
    "is refused again when run a second time with nothing left to replay",
    () =>
      inRepo(async (root) => {
        await laneThatPutsOneBack(root);

        const first = await replayGuarded(root, "main", "lane", true);
        expect(first.ok).toBe(false);
        expect(first.said.join("\n")).toContain(`docs/queue.md: ${DONE}`);

        // The first run rebased the lane, so the second finds it up to date.
        const second = await replayGuarded(root, "main", "lane", false);
        expect(second.ok).toBe(false);
        expect(second.said.join("\n")).toContain(`docs/queue.md: ${DONE}`);
        expect(second.said.join("\n")).not.toContain("rebased");
      }),
    repoTimeout(24),
  );

  test(
    "lands when a commit of the lane's says the entry was restored",
    () =>
      inRepo(async (root) => {
        const run = await laneThatPutsOneBack(root);
        await run(["commit", "--allow-empty", "-m", `the owner's word\n\nRestored: ${DONE}`]);

        const landed = await replayGuarded(root, "main", "lane", true);
        expect(landed.ok).toBe(true);
        expect(landed.said.join("\n")).toContain(`restored ${DONE}`);
      }),
    repoTimeout(24),
  );
});

describe("the Restored: line", () => {
  test("is read one title a line, and only at the start of a line", () => {
    const log = "subject\n\nRestored: a\nRestored: b\n  Restored: not this\nRestored: a\n";
    expect(restoredIn(log)).toEqual(["a", "b"]);
  });

  test("lets through only the titles it names", () => {
    const back = [{ file: "docs/queue.md", titles: ["a", "b"] }];
    expect(unrestored(back, ["a"])).toEqual([{ file: "docs/queue.md", titles: ["b"] }]);
    expect(unrestored(back, ["a", "b"])).toEqual([]);
  });
});
