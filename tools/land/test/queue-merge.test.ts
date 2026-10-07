import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { mergeQueue, join as rejoin, split } from "../queue-merge.js";
import { replay } from "../replay.js";

/**
 * The conflict `bun run land` used to stop on every time a lane drained an
 * item, in two halves: the merge as arithmetic on strings, and the same thing
 * driven through a real `git rebase`, because the whole claim is about what git
 * hands a resolver in its three stages.
 */

const PREAMBLE = `# Queue

How it works, and a format example that carries a heading of its own:

\`\`\`
## One line saying what to change

- **Found:** 2026-09-03, claude/some-lane
\`\`\`
`;

function file(...entries: string[]): string {
  return PREAMBLE + entries.map((e) => `\n${e}\n`).join("");
}

const A = "## An item\n\n- **Files:** `a.ts`\n\nWhat to do.";
const A_TAKEN =
  "## An item\n\n- **Taken:** 2026-09-09, claude/a\n- **Files:** `a.ts`\n\nWhat to do.";
const B = "## Another item\n\n- **Files:** `b.ts`\n\nWhat to do.";
const C = "## A third item\n\n- **Files:** `c.ts`\n\nFound while doing the first.";
const D = "## A fourth item\n\n- **Files:** `d.ts`\n\nWhat to do.";

describe("splitting a queue file", () => {
  test("the format example inside a fence is not an entry", () => {
    expect(split(PREAMBLE).entries).toEqual([]);
  });

  test("joining puts back exactly what was split", () => {
    const md = file(A, B);
    expect(rejoin(split(md))).toBe(md);
  });
});

describe("merging a queue file", () => {
  test("the lane's removal survives the trunk's Taken: line", () => {
    const merged = mergeQueue(file(A, B), file(A_TAKEN, B), file(B));
    expect(merged).toBe(file(B));
  });

  test("an entry the lane filed lands beside the trunk's own", () => {
    const merged = mergeQueue(file(A, B), file(A_TAKEN, B), file(B, C));
    expect(merged).toBe(file(B, C));
  });

  test("an entry only the trunk removed stays removed", () => {
    const merged = mergeQueue(file(A, B), file(A), file(A_TAKEN, B));
    expect(merged).toBe(file(A_TAKEN));
  });

  test("three entries the trunk finished in one go all stay out, not just some", () => {
    // The shape of 5780141b, 20 September 2026: a landing whose own guard
    // caught two resurrected entries and missed a third in the same merge.
    // Traced against every case this function's own logic branches on
    // (`docs/queue.md`'s own note on the finding), this is the one that
    // shape describes, and it merges correctly — so whatever picked the
    // third entry back out is upstream of this function, not in it.
    const merged = mergeQueue(file(A, B, C, D), file(D), file(A, B, C, D));
    expect(merged).toBe(file(D));
  });

  test("the trunk's Taken: line and the lane's narrowed Files: line are both kept", () => {
    // 7 October 2026: a lane claimed its second half on main, then narrowed
    // the same entry's `Files:` line one line below the claim.
    const narrowed = A.replace("`a.ts`", "`a.ts`, `a2.ts`");
    const both = A_TAKEN.replace("`a.ts`", "`a.ts`, `a2.ts`");
    expect(mergeQueue(file(A, B), file(A_TAKEN, B), file(narrowed, B))).toBe(file(both, B));
  });

  test("a paragraph the lane added and the trunk's Taken: line are both kept", () => {
    const mine = `${A}\n\nAnd a paragraph the lane added.`;
    const both = `${A_TAKEN}\n\nAnd a paragraph the lane added.`;
    expect(mergeQueue(file(A, B), file(A_TAKEN, B), file(mine, B))).toBe(file(both, B));
  });

  test("both sides rewriting the same line of one entry is not merged", () => {
    const theirs = A.replace("What to do.", "What the trunk says to do.");
    const mine = A.replace("What to do.", "What the lane says to do.");
    expect(mergeQueue(file(A, B), file(theirs, B), file(mine, B))).toBeNull();
  });

  test("both sides putting a different line at one point is not merged", () => {
    const mine = A.replace("- **Files:**", "- **Taken:** 2026-09-09, claude/b\n- **Files:**");
    expect(mergeQueue(file(A, B), file(A_TAKEN, B), file(mine, B))).toBeNull();
  });

  test("both sides rewriting the preamble is not merged", () => {
    const theirs = `${PREAMBLE}A trunk sentence.\n`;
    const mine = `${PREAMBLE}A lane sentence.\n`;
    const entry = `\n${A}\n`;
    expect(mergeQueue(`${PREAMBLE}${entry}`, `${theirs}${entry}`, `${mine}${entry}`)).toBeNull();
  });
});

describe("replaying a lane that drained an item", () => {
  let root = "";

  const WHO = {
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@t",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@t",
  };

  async function run(args: string[]): Promise<void> {
    await gitIn(args, root, WHO);
  }

  async function write(md: string): Promise<void> {
    await writeFile(join(root, "docs", "queue.md"), md);
  }

  test(
    "the take on main and the done in the lane merge without a hand on them",
    async () => {
      root = await mkdtemp(join(tmpdir(), "queue-merge-"));
      try {
        await run(["init", "-b", "main"]);
        await run(["config", "user.email", "t@t"]);
        await run(["config", "user.name", "t"]);
        await Bun.write(join(root, "docs", "parked.md"), "# Parked\n");
        await write(file(A, B));
        await run(["add", "-A"]);
        await run(["commit", "-m", "the queue"]);

        await run(["checkout", "-b", "lane"]);
        await write(file(B));
        await run(["commit", "-am", "one item out of the list"]);

        await run(["checkout", "main"]);
        await write(file(A_TAKEN, B));
        await run(["commit", "-am", "mark it taken"]);

        await run(["checkout", "lane"]);
        const out = await replay(root, "main");
        expect(out.ok).toBe(true);
        expect(out.resolved).toEqual(["docs/queue.md"]);
        expect(await Bun.file(join(root, "docs", "queue.md")).text()).toBe(file(B));
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
    repoTimeout(16),
  );

  test(
    "a kept lane's second half lands over its claim and the first half's stamp",
    async () => {
      // 7 October 2026, settled by hand: the claim's `Taken:` and the stamp's
      // `Measured:` on main, a narrowed `Files:` and a new ledger entry here.
      const log = (md: string) => writeFile(join(root, "docs", "time-log.md"), md);
      const first = "# Log\n\n## First half\n\nBottleneck: none.\n";
      const measured = "\n*Measured: 5 min.*\n";
      const second = "\n## Second half\n\nBottleneck: none.\n";
      const narrowed = A.replace("`a.ts`", "`a2.ts`");
      root = await mkdtemp(join(tmpdir(), "queue-merge-"));
      try {
        await run(["init", "-b", "main"]);
        await run(["config", "user.email", "t@t"]);
        await run(["config", "user.name", "t"]);
        await Bun.write(join(root, "docs", "parked.md"), "# Parked\n");
        await write(file(A, B));
        await log(first);
        await run(["add", "-A"]);
        await run(["commit", "-m", "the first half"]);

        await run(["checkout", "-b", "lane"]);
        await write(file(narrowed, B));
        await log(first + second);
        await run(["commit", "-am", "the second half"]);

        await run(["checkout", "main"]);
        await log(first + measured);
        await run(["commit", "-am", "the first half's stamp"]);
        await write(file(A_TAKEN, B));
        await run(["commit", "-am", "the second half taken"]);

        await run(["checkout", "lane"]);
        const out = await replay(root, "main");
        expect(out.conflicted).toEqual([]);
        expect(out.ok).toBe(true);
        const queue = await Bun.file(join(root, "docs", "queue.md")).text();
        expect(queue).toBe(file(A_TAKEN.replace("`a.ts`", "`a2.ts`"), B));
        const ledger = await Bun.file(join(root, "docs", "time-log.md")).text();
        expect(ledger).toBe(first + measured + second);
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
    repoTimeout(16),
  );
});
