import { describe, expect, it, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { closedBy, dropped, droppedAfter, droppedRefusal, takenBy } from "../queue-dropped.js";
import { queueSnapshots } from "../queue-guard.js";
import { split } from "../queue-merge.js";
import { replay } from "../replay.js";

/**
 * The guard against a landing taking out queue entries nobody closed — the
 * mirror of the re-add case in `queue-guard.test.ts`.
 *
 * On 29 September 2026 the governor's body lane rewrote its own entry with a
 * replace whose start anchor matched the entry above it, and three entries
 * went with it. The landing said nothing. The shapes below are that one and
 * the ordinary removals that must still land.
 */

const LANE = "claude/queue-the-governor";
const OWN = "THE GOVERNOR — the body";
const ABOVE = "THE WINCH — the look";
const OTHER = "THE SLUICE — the look";

const PREAMBLE = "# Queue\n\nPreamble.\n";
const entry = (title: string, taken?: string) =>
  `\n## ${title}\n\n- **Found:** 2026-09-29, lane\n${taken ? `- **Taken:** ${taken}\n` : ""}\nWhat to do.\n`;
const md = (...entries: string[]) => PREAMBLE + entries.join("");
const titles = (...names: string[]) => new Set(names);

const own = entry(OWN, `2026-09-29, ${LANE}`);

describe("which branches a Taken line names", () => {
  it("reads the worked branch and the claim branch in brackets", () => {
    const [one] = split(md(entry(OWN, `2026-09-29, worktree-x (claim: ${LANE})`))).entries;
    expect(one && takenBy(one)).toEqual(["worktree-x", LANE]);
  });

  it("names nobody for an entry that was never claimed", () => {
    const [one] = split(md(entry(ABOVE))).entries;
    expect(one && takenBy(one)).toEqual([]);
  });
});

describe("what a lane may take out", () => {
  it("its own claimed entry", () => {
    expect(dropped(md(entry(ABOVE), own), titles(ABOVE), LANE, "")).toEqual([]);
  });

  it("an entry it names word for word in one of its own commit messages", () => {
    const log = `Close two findings\n\nAlso closes "${ABOVE}".\n`;
    expect(dropped(md(entry(ABOVE), own), titles(), LANE, log)).toEqual([]);
  });

  it("an entry that moved to the other file, which is still kept", () => {
    expect(dropped(md(entry(ABOVE)), titles(ABOVE), LANE, "")).toEqual([]);
  });
});

describe("what a lane may not take out", () => {
  /** The governor's shape: its own entry closed, the ones above it lost. */
  it("an entry nobody claimed, beside the one it closed", () => {
    const trunk = md(entry(ABOVE), entry(OTHER), own);
    expect(dropped(trunk, titles(), LANE, "")).toEqual([ABOVE, OTHER]);
  });

  it("an entry claimed by another lane", () => {
    const theirs = entry(ABOVE, "2026-09-29, claude/queue-the-winch");
    expect(dropped(md(theirs), titles(), LANE, "")).toEqual([ABOVE]);
  });

  it("is not satisfied by the claim of a different branch", () => {
    const [one] = split(md(entry(ABOVE, "2026-09-29, claude/other"))).entries;
    expect(one && closedBy(one, LANE, "a message that names nothing")).toBe(false);
  });
});

describe("what a refused landing says", () => {
  const lines = droppedRefusal("main", [{ file: "docs/queue.md", titles: [ABOVE, OTHER] }]);

  it("says the trunk did not move, and names every entry", () => {
    expect(lines[0]).toContain("main was not moved");
    expect(lines.join("\n")).toContain(`docs/queue.md: ${ABOVE}`);
    expect(lines.join("\n")).toContain(`docs/queue.md: ${OTHER}`);
  });

  it("says how to put them back, and how to close one honestly", () => {
    expect(lines.join("\n")).toContain("put them back");
    expect(lines.at(-1)).toContain("bun run queue take");
  });
});

const WHO = {
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};

/** The governor's landing through real git: the trunk claims the lane's entry,
 * the lane's one commit takes out that entry and the one above it, and the
 * trunk moves on underneath so there is something to replay onto. */
test(
  "the replayed tree names the entry the lane lost, and only that one",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "queue-dropped-"));
    try {
      const run = (args: string[]) => gitIn(args, root, WHO);
      const write = (text: string) => writeFile(join(root, "docs", "queue.md"), text);
      await run(["init", "-b", "main"]);
      await run(["config", "user.email", "t@t"]);
      await run(["config", "user.name", "t"]);
      await Bun.write(join(root, "docs", "parked.md"), "# Parked\n");
      await write(md(entry(ABOVE), own));
      await run(["add", "-A"]);
      await run(["commit", "-m", `Mark "${OWN}" taken`]);
      await run(["checkout", "-b", LANE]);
      await write(PREAMBLE);
      await run(["commit", "-am", "the body, and a replace that took too much"]);
      await run(["checkout", "main"]);
      await Bun.write(join(root, "other.txt"), "the trunk moved on\n");
      await run(["add", "other.txt"]);
      await run(["commit", "-m", "something else"]);
      await run(["checkout", LANE]);

      const mergeBase = await run(["merge-base", "main", "HEAD"]);
      const show = (rev: string, file: string) => run(["show", `${rev}:${file}`]);
      const before = await queueSnapshots("main", show, mergeBase);
      expect(await replay(root, "main")).toMatchObject({ ok: true });
      const log = await run(["log", "--format=%B", "main..HEAD"]);

      expect(await droppedAfter(root, before, LANE, log)).toEqual([
        { file: "docs/queue.md", titles: [ABOVE] },
      ]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  repoTimeout(24),
);
