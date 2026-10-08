import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor } from "../claim.js";
import { type Item, parseItems } from "../queue.js";
import { claim, trunkTaken } from "../repo.js";
import { spentHere } from "../spent.js";

/**
 * A claim whose commit on the trunk fails, and the `take` after it.
 *
 * On 30 September 2026 a stale `index.lock` in the main checkout made the
 * marking commit fail. The `Taken:` line stayed in that tree uncommitted and
 * the claim branch stayed standing, so the retry was "left alone — uncommitted
 * changes", and once the line was taken out by hand the third try said the
 * item was already taken, by the branch its own first try had made. Here the
 * commit is failed once by a hook, which is the lock's effect without its
 * timing. What is proved is that the failure leaves the trunk's tree as it was
 * and no branch behind, that the next claim goes through, and that a claim
 * branch with no line anywhere reads as spent rather than as a holder.
 */

const ON_MAIN = `# Queue

## Every other boss answers a touch

- **Found:** 2026-09-28, claude/some-lane
- **Files:** \`packages/render/test/mark-feedback-roll-out.test.ts\`

One boss a lane.
`;

const item: Item = (() => {
  const found = parseItems(ON_MAIN, "queue")[0];
  if (!found) throw new Error("no entry in the fixture");
  return found;
})();
const BRANCH = branchFor(item);

const FAIL_ONCE = `#!/bin/sh
f="$(git rev-parse --git-common-dir)/fail-once"
if [ -f "$f" ]; then rm "$f"; exit 1; fi
`;

const roots: string[] = [];

/** A repository whose `main` carries the entry and no mark. */
async function repo(): Promise<{ root: string; run: (args: string[]) => Promise<string> }> {
  const root = await mkdtemp(join(tmpdir(), "ns-queue-fails-"));
  roots.push(root);
  const run = (args: string[]) => gitIn(args, root);
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), ON_MAIN);
  await run(["add", "docs/queue.md"]);
  await run(["commit", "-q", "-m", "first"]);
  return { root, run };
}

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
}, CLEANUP_MS);

describe("a claim whose commit on the trunk fails once", () => {
  let root = "";
  let run: (args: string[]) => Promise<string> = async () => "";
  let failure = "";
  let after = "";
  let branchAfter = "";
  let second = "";
  const trunk = () => `${root}-main`;

  beforeAll(async () => {
    ({ root, run } = await repo());
    // Shaped like this machine: the lane is a tree of its own, and `main` is
    // held by another, which is where the marking commit is made.
    await run(["checkout", "-q", "-b", "lane"]);
    await run(["worktree", "add", "-q", trunk(), "main"]);
    roots.push(trunk());
    const hook = join(root, ".git", "hooks", "pre-commit");
    await writeFile(hook, FAIL_ONCE);
    await chmod(hook, 0o755);
    await writeFile(join(root, ".git", "fail-once"), "");
    try {
      claim(item, root);
    } catch (e) {
      failure = String(e);
    }
    after = await readFile(join(trunk(), "docs", "queue.md"), "utf8");
    branchAfter = await run(["branch", "--list", BRANCH]);
    second = claim(item, root);
  }, repoTimeout(12));

  it(
    "throws, puts the trunk's copy back as it was, and leaves no branch",
    () => {
      expect(failure).toMatch(/could not commit docs\/queue\.md on main/);
      expect(after).toBe(ON_MAIN);
      expect(branchAfter).toBe("");
    },
    repoTimeout(2),
  );

  it(
    "is claimed by the next try, with the line on the trunk",
    async () => {
      expect(second).toBe(BRANCH);
      expect(trunkTaken(item, root)).toMatch(/, lane \(claim: claude\/queue-[a-z-]+\)$/);
      expect(await run(["rev-parse", BRANCH])).toBe(await run(["rev-parse", "main"]));
      expect(await gitIn(["status", "--porcelain"], trunk())).toBe("");
    },
    repoTimeout(4),
  );
});

describe("a claim branch with no line anywhere", () => {
  it(
    "is spent when nobody stands on it, and live when somebody does",
    async () => {
      const { root, run } = await repo();
      await run(["branch", BRANCH]);
      expect(spentHere(item, "", root)).toEqual([BRANCH]);
      await run(["checkout", "-q", BRANCH]);
      expect(spentHere(item, "", root)).toBeNull();
    },
    repoTimeout(8),
  );
});
