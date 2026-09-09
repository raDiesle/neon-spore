import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

  test("both sides rewriting one entry is not merged", () => {
    const mine = `${A}\n\nAnd a paragraph the lane added.`;
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

  async function run(args: string[]): Promise<void> {
    const proc = Bun.spawn(["git", ...args], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "t",
        GIT_AUTHOR_EMAIL: "t@t",
        GIT_COMMITTER_NAME: "t",
        GIT_COMMITTER_EMAIL: "t@t",
      },
    });
    const [err, code] = await Promise.all([new Response(proc.stderr).text(), proc.exited]);
    if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim()}`);
  }

  async function write(md: string): Promise<void> {
    await writeFile(join(root, "docs", "queue.md"), md);
  }

  test("the take on main and the done in the lane merge without a hand on them", async () => {
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
  }, 20_000);
});
