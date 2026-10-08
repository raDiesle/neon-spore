import { afterEach, beforeEach, expect, describe as group, test } from "bun:test";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, gitIn, repoTimeout } from "../../test/repo-time.js";
import { RACE_RETRIES, raceRetry } from "../race.js";
import { rerace } from "../race-retry.js";
import { replay, SETTLED } from "../replay.js";

/**
 * **The trunk moves between the check and the move.** Each try used to throw
 * the whole of `bun run check` away (26 September 2026, five times running on
 * a landing of two docs files). Now a trunk that took none of the lane's files
 * is replayed onto and checked narrowly over both diffs — here against a real
 * repository whose trunk is moved after the lane was checked, with the check
 * handed in so the question is the replay and the diffs, not the suite.
 */

group("raceRetry", () => {
  const settled = new Set(["docs/queue.md"]);

  test("a trunk that took none of the lane's files is replayed onto", () => {
    const said = raceRetry("main", ["a.ts"], ["b.ts"], settled, 0);
    expect(said.retry).toBe(true);
  });

  test("a record both sides touched is no race: the replay merges it", () => {
    expect(raceRetry("main", ["a.ts", "docs/queue.md"], ["docs/queue.md"], settled, 0).retry).toBe(
      true,
    );
  });

  test("a file both sides touched needs the full check, and is named", () => {
    const said = raceRetry("main", ["a.ts"], ["a.ts", "b.ts"], settled, 0);
    expect(said.retry).toBe(false);
    if (!said.retry) expect(said.why).toContain("a.ts");
  });

  test("a trunk that never stands still is given up after the bound", () => {
    expect(raceRetry("main", ["a.ts"], ["b.ts"], settled, RACE_RETRIES).retry).toBe(false);
  });

  test("the records the replay settles are what count as settled", () => {
    expect(SETTLED.has("docs/queue.md")).toBe(true);
    expect(SETTLED.has("docs/time-log.md")).toBe(true);
  });
});

let root = "";
let lane = "";
const git = (args: string[], cwd = root) => gitIn(args, cwd);

async function commit(cwd: string, file: string, text: string): Promise<string> {
  await writeFile(join(cwd, file), text);
  await git(["add", file], cwd);
  await git(["commit", "-q", "-m", `${file}: ${text.trim()}`], cwd);
  return git(["rev-parse", "HEAD"], cwd);
}

beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-race-")));
  await git(["init", "-b", "main", "--quiet"]);
  await git(["config", "user.email", "test@example.com"]);
  await git(["config", "user.name", "Test"]);
  await writeFile(join(root, ".gitignore"), ".claude/\n");
  await git(["add", ".gitignore"]);
  await commit(root, "a.txt", "one\n");
  await mkdir(join(root, ".claude", "worktrees"), { recursive: true });
  lane = join(root, ".claude", "worktrees", "lane");
  await git(["worktree", "add", "--quiet", lane, "-b", "lane"]);
  await commit(lane, "lane.txt", "the lane's work\n");
}, repoTimeout(12));

afterEach(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
}, CLEANUP_MS);

test(
  "a trunk that moved on other files is replayed onto and checked from where the lane was",
  async () => {
    const before = await git(["rev-parse", "main"]);
    // Another lane lands while this one is in the check.
    const now = await commit(root, "other.txt", "someone else's\n");
    const asked: string[] = [];
    const out = await rerace({
      root: lane,
      trunk: "main",
      before,
      now,
      tries: 0,
      replay: async () => ({ ok: (await replay(lane, "main")).ok, said: [] }),
      check: async (since) => {
        asked.push(since);
        return true;
      },
    });
    expect(out.ok).toBe(true);
    expect(asked).toEqual([before]);
    // The lane now stands on the trunk that arrived, so the fast-forward is there.
    expect(await git(["merge-base", "main", "HEAD"], lane)).toBe(now);
    const both = await git(["diff", "--name-only", before, "HEAD"], lane);
    expect(both.split("\n").sort()).toEqual(["lane.txt", "other.txt"]);
  },
  repoTimeout(12),
);

test(
  "a trunk that moved on the lane's own file is refused, and nothing is replayed",
  async () => {
    const before = await git(["rev-parse", "main"]);
    const laneHead = await git(["rev-parse", "HEAD"], lane);
    const now = await commit(root, "lane.txt", "a collision\n");
    let replayed = false;
    const out = await rerace({
      root: lane,
      trunk: "main",
      before,
      now,
      tries: 0,
      replay: async () => {
        replayed = true;
        return { ok: true, said: [] };
      },
      check: async () => true,
    });
    expect(out.ok).toBe(false);
    expect(out.said.join("\n")).toContain("lane.txt");
    expect(replayed).toBe(false);
    expect(await git(["rev-parse", "HEAD"], lane)).toBe(laneHead);
  },
  repoTimeout(10),
);
