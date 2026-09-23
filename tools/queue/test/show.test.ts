import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";

/**
 * `show` prints an item's prompt and changes nothing.
 *
 * Driven as a process, not as a function, because what it must not do is
 * everything `run.ts` does around the call — a branch, a `Taken:` line, a
 * commit on the trunk. The tool finds its repository from its own path
 * (`tree.ts`), so it is copied into a scratch repository and run there: a
 * `show` that claimed would claim in the scratch copy, never in this tree and
 * never on `origin`.
 */

const QUEUE = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.

## Name the thing the lane found

- **Found:** 2026-09-10, claude/other-lane
- **Taken:** 2026-09-22, claude/queue-name-the-thing-the-lane-found
- **Files:** \`tools/queue/repo.ts\`

Somebody is on this one.
`;

let root = "";
const run = (args: string[]): Promise<string> => gitIn(args, root);

/** Every ref with the commit it points at, the tree's status and both files. */
async function snapshot(): Promise<string> {
  return [
    await run(["for-each-ref", "--format=%(refname) %(objectname)"]),
    await run(["status", "--porcelain"]),
    await readFile(join(root, "docs", "queue.md"), "utf8"),
    await readFile(join(root, "docs", "parked.md"), "utf8"),
  ].join("\n---\n");
}

async function show(arg: string): Promise<string> {
  const proc = Bun.spawn(["bun", join(root, "tools", "queue", "run.ts"), "show", arg], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`show ${arg} exited ${code}: ${err || out}`);
  return out;
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-show-"));
  await cp(join(import.meta.dirname, ".."), join(root, "tools", "queue"), {
    recursive: true,
    filter: (src) => !src.includes(`${join("queue", "test")}`),
  });
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), QUEUE);
  await writeFile(join(root, "docs", "parked.md"), "# Parked\n");
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await run(["add", "."]);
  await run(["commit", "-q", "-m", "first"]);
}, repoTimeout(8));

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
}, repoTimeout(2));

describe("queue show", () => {
  it(
    "prints a free item's prompt by title and leaves the refs and the queue alone",
    async () => {
      const before = await snapshot();
      const out = await show("Split the wave editor's cell panel");
      expect(out).toContain("## Split the wave editor's cell panel");
      expect(out).toContain("It is 310 lines and does two jobs.");
      expect(out).toContain("claude/queue-split-the-wave-editors-cell-panel");
      expect(out).toContain("claimed nothing");
      expect(await snapshot()).toBe(before);
    },
    repoTimeout(10),
  );

  it(
    "prints a held item by number, naming the branch it is held on, and changes nothing",
    async () => {
      const before = await snapshot();
      const out = await show("2");
      expect(out).toContain("## Name the thing the lane found");
      expect(out).toContain("Held —");
      expect(out).toContain("claude/queue-name-the-thing-the-lane-found");
      expect(await snapshot()).toBe(before);
    },
    repoTimeout(10),
  );
});
