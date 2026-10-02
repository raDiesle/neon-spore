import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor } from "../claim.js";
import { markTaken, takenIn } from "../edit.js";
import { giveBack, holdsClaim } from "../give-back.js";
import { type Item, parseItems } from "../queue.js";
import { claim, trunkTaken } from "../repo.js";

/**
 * **`release` then `take`, from a tree standing on another branch** —
 * `give-back.ts`. On 2 October 2026 a lapsed claim was given back and taken
 * again from a worktree on a branch already landed: the give-back cut the
 * `Taken:` line out of that tree's copy, uncommitted, and `git checkout` of
 * the fresh claim refused. Each repository here is that shape: a trunk
 * carrying a stale mark, and a tree on `landed`, cut from it. And one a lane
 * giving back its own claim, whose copy is cut and committed — or left
 * uncommitted when the lane was already editing the file.
 */

const ENTRY = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const TITLE = "Split the wave editor's cell panel";
const CLAIM = branchFor(parseItems(ENTRY, "queue")[0] as Item);
const STALE = `2026-10-01, ${CLAIM}`;

const roots: string[] = [];

/** A trunk whose entry carries `mark`, and this tree on `branch`, cut from it. */
async function repo(branch: string, mark: string) {
  const root = await mkdtemp(join(tmpdir(), "ns-queue-give-back-"));
  roots.push(root);
  const run = (args: string[]) => gitIn(args, root);
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), markTaken(ENTRY, TITLE, mark));
  await run(["add", "docs/queue.md"]);
  await run(["commit", "-q", "-m", "first"]);
  await run(["checkout", "-q", "-b", branch]);
  const here = async () => await readFile(join(root, "docs", "queue.md"), "utf8");
  const item = async () => parseItems(await here(), "queue")[0] as Item;
  return { root, run, here, item };
}

afterAll(async () => {
  for (const root of roots) await rm(root, { recursive: true, force: true });
}, repoTimeout(4));

describe("a give-back from a tree on another branch", () => {
  let r: Awaited<ReturnType<typeof repo>>;

  beforeAll(async () => {
    r = await repo("claude/queue-the-lampreys-look-41", STALE);
  }, repoTimeout(8));

  it(
    "takes the line off the trunk and leaves this tree clean",
    async () => {
      const item = await r.item();
      expect(holdsClaim(item, STALE, r.root)).toBe(false);
      giveBack(item, STALE, r.root);
      expect(trunkTaken(item, r.root)).toBe("");
      expect(takenIn(await r.here(), TITLE)).toBe(STALE);
      expect(await r.run(["status", "--porcelain"])).toBe("");
    },
    repoTimeout(4),
  );

  it(
    "then lets the fresh claim be taken and checked out, and the tree is clean",
    async () => {
      const branch = claim(await r.item(), r.root);
      expect(branch).toBe(CLAIM);
      await r.run(["checkout", "-q", branch]);
      expect(await r.run(["status", "--porcelain"])).toBe("");
      expect(takenIn(await r.here(), TITLE)).toBe(trunkTaken(await r.item(), r.root));
    },
    repoTimeout(6),
  );
});

describe("a give-back from the lane that holds the claim", () => {
  it(
    "takes the line off this tree's copy as well",
    async () => {
      const r = await repo(CLAIM, STALE);
      const item = await r.item();
      expect(holdsClaim(item, STALE, r.root)).toBe(true);
      giveBack(item, STALE, r.root);
      expect(trunkTaken(item, r.root)).toBe("");
      expect(takenIn(await r.here(), TITLE)).toBe("");
      // Committed, so `land` finds the tree clean; and it is the trunk's own
      // patch, so the landing's rebase leaves nothing of it.
      expect(await r.run(["status", "--porcelain"])).toBe("");
      await r.run(["rebase", "-q", "main"]);
      expect(await r.run(["rev-list", "main..HEAD"])).toBe("");
    },
    repoTimeout(8),
  );

  it(
    "leaves the cut uncommitted in a copy the lane is already editing",
    async () => {
      const r = await repo(CLAIM, STALE);
      await writeFile(
        join(r.root, "docs", "queue.md"),
        `${await r.here()}A finding half written.\n`,
      );
      giveBack(await r.item(), STALE, r.root);
      expect(takenIn(await r.here(), TITLE)).toBe("");
      expect(await r.here()).toContain("A finding half written.");
      expect(await r.run(["status", "--porcelain"])).toContain("docs/queue.md");
      expect(await r.run(["rev-list", "--count", "main..HEAD"])).toBe("0");
    },
    repoTimeout(8),
  );

  it(
    "knows the lane by the branch a mark names first, too",
    async () => {
      const mark = `2026-10-01, claude/task-abc (claim: ${CLAIM})`;
      const r = await repo("claude/task-abc", mark);
      expect(holdsClaim(await r.item(), mark, r.root)).toBe(true);
    },
    repoTimeout(8),
  );
});
