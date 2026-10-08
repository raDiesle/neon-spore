import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CLEANUP_MS, gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor } from "../claim.js";
import { type Item, parseItems } from "../queue.js";
import { claim, headBranch, trunkTaken, unmark } from "../repo.js";

/**
 * A claim on a branch this session kept (`kept.ts`).
 *
 * 28 September 2026: the mark-feedback roll-out is worked one boss a lane and
 * landed with `bun run land --keep`, which leaves its claim branch checked out
 * and equal to `main`, and each landing takes the entry's `Taken:` line off with
 * its rewritten words. The next boss's `take` failed on `git branch`, because
 * the branch it would make is the one the tree is standing on. Each repository
 * here is shaped like that session, and one like a lane on another worktree.
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

const roots: string[] = [];

/** A repository whose trunk carries the entry and no mark, and `lane` on it. */
async function repo(): Promise<{ root: string; run: (args: string[]) => Promise<string> }> {
  const root = await mkdtemp(join(tmpdir(), "ns-queue-kept-"));
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

describe("a claim on the branch this tree kept and stands on", () => {
  let root = "";
  let run: (args: string[]) => Promise<string> = async () => "";
  let branch = "";

  beforeAll(async () => {
    ({ root, run } = await repo());
    // What `land --keep` leaves: the claim branch checked out, at main's tip.
    await run(["checkout", "-q", "-b", BRANCH]);
    branch = claim(item, root);
  }, repoTimeout(10));

  it(
    "hands the branch back instead of refusing it",
    () => {
      expect(branch).toBe(BRANCH);
      expect(headBranch(root)).toBe(BRANCH);
    },
    repoTimeout(2),
  );

  it(
    "marks the trunk, and brings the branch and its tree up onto the mark",
    async () => {
      expect(trunkTaken(item, root)).toMatch(new RegExp(`^\\d{4}-\\d{2}-\\d{2}, ${BRANCH}$`));
      expect(await run(["rev-parse", "HEAD"])).toBe(await run(["rev-parse", "main"]));
      const md = await readFile(join(root, "docs", "queue.md"), "utf8");
      expect(parseItems(md, "queue")[0]?.taken).toBe(trunkTaken(item, root));
      expect(await run(["status", "--porcelain"])).toBe("");
    },
    repoTimeout(4),
  );
});

describe("a re-stamp of the claim this tree kept and stands on", () => {
  it(
    "leaves the line in this tree's copy as well as on the trunk",
    async () => {
      // What `take` does with a mark of its own already standing: `unmark`
      // takes it off both copies, and `claim` writes the same line back.
      const { root, run } = await repo();
      const today = new Date().toISOString().slice(0, 10);
      const marked = ON_MAIN.replace(
        "- **Files:**",
        `- **Taken:** ${today}, ${BRANCH}\n- **Files:**`,
      );
      await writeFile(join(root, "docs", "queue.md"), marked);
      await run(["commit", "-q", "-am", "marked"]);
      await run(["checkout", "-q", "-b", BRANCH]);
      unmark(item, root);
      claim(item, root);
      const md = await readFile(join(root, "docs", "queue.md"), "utf8");
      expect(parseItems(md, "queue")[0]?.taken).toBe(`${today}, ${BRANCH}`);
      expect(await run(["status", "--porcelain"])).toBe("");
    },
    repoTimeout(12),
  );
});

describe("a claim on a kept branch nobody stands on", () => {
  let root = "";
  let run: (args: string[]) => Promise<string> = async () => "";

  beforeAll(async () => {
    ({ root, run } = await repo());
    await run(["branch", BRANCH]);
    await run(["checkout", "-q", "-b", "lane"]);
    claim(item, root);
  }, repoTimeout(10));

  it(
    "moves the branch onto the marking commit, as a fresh claim's is",
    async () => {
      expect(await run(["rev-parse", BRANCH])).toBe(await run(["rev-parse", "main"]));
      expect(await run(["rev-list", "--count", "main"])).toBe("2");
    },
    repoTimeout(4),
  );
});

describe("a standing branch that is not this tree's to hand back", () => {
  it(
    "is refused, and left standing, when it holds a commit main has not got",
    async () => {
      const { root, run } = await repo();
      await run(["checkout", "-q", "-b", BRANCH]);
      await writeFile(join(root, "work.txt"), "mid-lane");
      await run(["add", "work.txt"]);
      await run(["commit", "-q", "-m", "work"]);
      expect(() => claim(item, root)).toThrow(/holds commits main has not got/);
      expect(await run(["rev-parse", "--abbrev-ref", "HEAD"])).toBe(BRANCH);
      expect(trunkTaken(item, root)).toBe("");
    },
    repoTimeout(12),
  );

  it(
    "is refused when another worktree stands on it",
    async () => {
      const { root, run } = await repo();
      await run(["checkout", "-q", "-b", "lane"]);
      await run([
        "worktree",
        "add",
        "-q",
        join(root, "..", `${root.split("/").pop()}-wt`),
        "-b",
        BRANCH,
        "main",
      ]);
      roots.push(join(root, "..", `${root.split("/").pop()}-wt`));
      expect(() => claim(item, root)).toThrow(/another worktree stands on/);
      expect(trunkTaken(item, root)).toBe("");
    },
    repoTimeout(12),
  );
});
