import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor, heldElsewhere } from "../claim.js";
import { markTaken } from "../edit.js";
import { commitOnRef } from "../git.js";
import { claimedBranch } from "../mark.js";
import { type Item, parseItems } from "../queue.js";
import { claim, headBranch, trunkHas, unmark } from "../repo.js";

/**
 * A claim on an entry the trunk has not got, and a claim that fails halfway.
 *
 * The owner asks for an item to be queued and worked in the same sitting, so
 * the entry is in the lane's working tree and nowhere else. On 10 September
 * 2026 `take` made its branch, went to write the `Taken:` line onto `main` —
 * where there was no entry to write it into — and threw; the branch survived,
 * and the second `take` said the item was already taken. This repository is
 * shaped like that lane: `main` a ref beside a checked-out lane, one entry on
 * both and one only in the tree. What is proved is that the tree's own entry
 * is marked where it is and the trunk left alone, and that a claim which
 * cannot be written leaves no branch behind it.
 */

const ON_MAIN = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const ONLY_HERE = `
## Name the thing the lane found

- **Found:** 2026-09-10, hit-looks
- **Files:** \`tools/queue/repo.ts\`

Queued and worked in one sitting.
`;

/**
 * The same entry after the lane finished half of it and rewrote the words, with
 * the `Taken:` line left exactly as it was. That line is the whole of the
 * trouble: its worked branch is the predecessor, landed and swept, and its
 * claim branch is what `branchFor` derived from the *old* title — a branch
 * these words do not derive and no ref carries. The one thing still saying the
 * lane holds it is that the claim branch is the lane's own HEAD.
 */
const RETITLED = `
## Name the half the lane finished

- **Found:** 2026-09-10, hit-looks
- **Taken:** 2026-09-21, claude/queue-name-the-thing-the-lane-found (claim: lane)
- **Files:** \`tools/queue/repo.ts\`

Half of it is done, so the words changed.
`;

let root = "";

/** Every call in this file runs in the one repository `beforeAll` built. */
const run = (args: string[]): Promise<string> => gitIn(args, root);

function itemNamed(md: string, title: string): Item {
  const item = parseItems(md, "queue").find((i) => i.title === title);
  if (!item) throw new Error(`no ${title} in the fixture`);
  return item;
}

async function branches(): Promise<string[]> {
  return (await run(["for-each-ref", "--format=%(refname:short)", "refs/heads"])).split("\n");
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-claim-"));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), ON_MAIN);
  await run(["add", "docs/queue.md"]);
  await run(["commit", "-q", "-m", "first"]);
  // The lane, with the trunk left as a ref beside it, and the entry the lane
  // found committed on the lane alone.
  await run(["checkout", "-q", "-b", "lane"]);
  await writeFile(join(root, "docs", "queue.md"), ON_MAIN + ONLY_HERE);
  await run(["commit", "-q", "-am", "queue what the lane found"]);
}, repoTimeout(8));

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
}, repoTimeout(2));

describe("trunkHas", () => {
  it(
    "sees the entry main carries and not the one only the lane has",
    () => {
      const md = ON_MAIN + ONLY_HERE;
      expect(trunkHas(itemNamed(md, "Split the wave editor's cell panel"), root)).toBe(true);
      expect(trunkHas(itemNamed(md, "Name the thing the lane found"), root)).toBe(false);
    },
    repoTimeout(4),
  );
});

describe("a claim on an entry only the lane has", () => {
  const item = itemNamed(ON_MAIN + ONLY_HERE, "Name the thing the lane found");
  let branch = "";

  beforeAll(() => {
    branch = claim(item, root);
  }, repoTimeout(6));

  it(
    "makes the branch, which is the gate the other worktrees read",
    async () => {
      expect(branch).toBe(branchFor(item));
      expect(await branches()).toContain(branch);
    },
    repoTimeout(2),
  );

  it(
    // This tree is on "lane", not the derived `branch` — exactly the shape a
    // session dealt a branch of its own is in, so the mark below is the one
    // this whole item asked for: the tree's real branch first, the derived
    // one after it, rather than only the derived one naming nobody's work.
    "writes the Taken: line into the working copy, naming the branch the tree is really on",
    async () => {
      const md = await readFile(join(root, "docs", "queue.md"), "utf8");
      const marked = parseItems(md, "queue").find((i) => i.title === item.title);
      expect(marked?.taken).toMatch(
        new RegExp(`^\\d{4}-\\d{2}-\\d{2}, lane \\(claim: ${branch}\\)$`),
      );
    },
    repoTimeout(1),
  );

  it(
    "leaves main exactly as it was, uncommitted and unpushed",
    async () => {
      expect(await run(["show", "main:docs/queue.md"])).toBe(ON_MAIN.trim());
      expect(await run(["rev-list", "--count", "main"])).toBe("1");
      expect(await run(["status", "--porcelain"])).toBe("M docs/queue.md");
    },
    repoTimeout(4),
  );
});

describe("a claim that cannot write its line", () => {
  const item = itemNamed(ON_MAIN, "Split the wave editor's cell panel");

  beforeAll(() => {
    // Somebody else's mark already on main: the one state `markTaken` refuses.
    commitOnRef(
      root,
      "main",
      "docs/queue.md",
      (md) => markTaken(md, item.title, "2026-09-09, claude/queue-somebody-else"),
      "somebody else's claim",
    );
  }, repoTimeout(6));

  it(
    "throws, and takes the branch it made back down with it",
    async () => {
      expect(() => claim(item, root)).toThrow(/already taken/);
      expect(await branches()).not.toContain(branchFor(item));
    },
    repoTimeout(6),
  );
});

/**
 * 21 September 2026, twice in two days: the lane holding the sixteen-films
 * entry rewrote its title, and `bun run queue take` told it the entry was
 * somebody else's. `claimOn` says who holds an item and cannot say whether
 * that is the caller — and here it is, under a name the entry no longer has.
 */
describe("re-marking an entry this lane has retitled", () => {
  const item = itemNamed(ON_MAIN + RETITLED, "Name the half the lane finished");
  let branch = "";

  beforeAll(async () => {
    await writeFile(join(root, "docs", "queue.md"), ON_MAIN + RETITLED);
    // The two halves `take` runs: this lane's own stale line off, a fresh one on.
    unmark(item, root);
    branch = claim(item, root);
  }, repoTimeout(8));

  it(
    "reads as nobody else's, because the mark's claim branch is this tree's HEAD",
    () => {
      expect(claimedBranch(item.taken)).toBe("lane");
      expect(headBranch(root)).toBe("lane");
      expect(heldElsewhere(item, ["main", "lane"], headBranch(root))).toBeUndefined();
    },
    repoTimeout(4),
  );

  it(
    "leaves one Taken: line, the fresh one, naming the branch the new words derive",
    async () => {
      const md = await readFile(join(root, "docs", "queue.md"), "utf8");
      expect(branch).toBe(branchFor(item));
      expect(md.match(/- [*][*]Taken:[*][*]/g)).toHaveLength(1);
      expect(itemNamed(md, item.title).taken).toMatch(
        new RegExp(`^\\d{4}-\\d{2}-\\d{2}, lane \\(claim: ${branch}\\)$`),
      );
    },
    repoTimeout(4),
  );

  it(
    "makes the branch the new title derives, and leaves main alone",
    async () => {
      expect(await branches()).toContain("claude/queue-name-the-half-the-lane-finished");
      expect(await run(["show", "main:docs/queue.md"])).not.toContain("half the lane finished");
    },
    repoTimeout(4),
  );
});
