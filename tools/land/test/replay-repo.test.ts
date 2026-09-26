import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { replay } from "../replay.js";

/**
 * The replay against a repository git actually made.
 *
 * `ledger-merge.ts` and `queue-merge.ts` are proved against hand-written
 * strings, which says everything about the merge and nothing about the wiring:
 * whether the key in `RESOLVERS` is the path git reports as conflicted, and
 * whether a resolver is reached at all. A one-character difference in that key
 * passes every pure test in the tree and leaves the landing stopping exactly
 * as it did before — which is the failure this file exists to catch.
 *
 * So: one real repository, two real commits appending to the same end of the
 * ledger, one real `git rebase`. The pattern is `repo.test.ts`'s, `realpath` on
 * the way in for the same reason it gives.
 *
 * The ledger they both append to is the one `main` really carried on 25
 * September 2026: one heading written twice with two different bodies, far
 * from the end both sides wrote to. That alone made every landing that day
 * stop on two plain appends (`record-merge.ts`, `keyed`).
 */

let root = "";

/** Every call in this file runs in the one repository `beforeAll` built. */
async function git(args: string[]): Promise<void> {
  await gitIn(args, root);
}

const PREAMBLE = "# Where a session's time goes\n\nOne `##` entry per lane.\n";

function entry(name: string): string {
  return `\n## 2026-09-16 — ${name} — what it did\n\n| activity | minutes |\n|---|---|\n| reading | 5 |\n\nThe bottleneck was reading.\n`;
}

/** One lane landed in two parts under one subject, each with its own entry. */
const TWICE = `${entry("two-parts").replace("reading | 5", "reading | 10")}${entry("two-parts")}`;
const BASE = PREAMBLE + TWICE;

async function ledger(text: string, message: string): Promise<void> {
  await writeFile(join(root, "docs", "time-log.md"), text);
  await git(["add", "docs/time-log.md"]);
  await git(["commit", "-q", "-m", message]);
}

beforeAll(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "ns-replay-")));
  await git(["init", "-b", "main", "--quiet"]);
  await git(["config", "user.email", "test@example.com"]);
  await git(["config", "user.name", "Test"]);
  await Bun.write(join(root, "docs", "time-log.md"), BASE);
  await git(["add", "."]);
  await git(["commit", "-q", "-m", "the ledger"]);

  // The lane branches here, then both sides append to the same last line.
  await git(["switch", "-c", "lane", "--quiet"]);
  await ledger(BASE + entry("my-lane"), "my lane, and its entry");
  await git(["switch", "main", "--quiet"]);
  await ledger(BASE + entry("their-lane"), "their lane, landed first");
  await git(["switch", "lane", "--quiet"]);
}, repoTimeout(14));

afterAll(async () => {
  await rm(root, { recursive: true, force: true }).catch(() => {});
}, repoTimeout(2));

describe("two lanes appending to the ledger in the same hour", () => {
  test(
    "replays without stopping, and says which file it settled",
    async () => {
      const out = await replay(root, "main");
      expect(out.ok).toBe(true);
      expect(out.conflicted).toEqual([]);
      // Named, not silent: a landing that resolved a record should say so.
      expect(out.resolved).toContain("docs/time-log.md");
    },
    repoTimeout(12),
  );

  test(
    "keeps both entries, the trunk's first",
    async () => {
      const text = await Bun.file(join(root, "docs", "time-log.md")).text();
      expect(text).toContain("their-lane");
      expect(text).toContain("my-lane");
      expect(text.indexOf("their-lane")).toBeLessThan(text.indexOf("my-lane"));
      // The preamble and both bodies under the doubled heading survived a
      // merge that touched neither of them.
      expect(text.startsWith(BASE)).toBe(true);
    },
    repoTimeout(2),
  );

  test(
    "leaves the lane on top of the trunk, with both commits in history",
    async () => {
      const log = await gitIn(["log", "--oneline", "main..HEAD"], root);
      expect(log).toContain("my lane");
      expect(log).not.toContain("their lane");
    },
    repoTimeout(2),
  );
});
