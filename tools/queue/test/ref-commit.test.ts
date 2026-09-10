import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { markTaken } from "../edit.js";
import { parseItems } from "../queue.js";
import { commitOnRef } from "../repo.js";

/**
 * A `Taken:` line written in a clone — the half of a claim that used not to
 * be made there.
 *
 * A session started from a phone has one checkout, standing on its own lane,
 * and `main` beside it as a ref nothing has checked out. `bun run queue take`
 * there used to say `⚑ left alone — nothing has main checked out` and report
 * the item ongoing anyway: the branch was made, which no other clone can see,
 * and the line was not, which is the half that was written for exactly those
 * clones. This repository is shaped that way, and what is proved is that the
 * line lands on `main` as a commit of its own, that the lane and its working
 * tree are untouched, and that a `main` which moved meanwhile is refused
 * rather than overwritten.
 */

const ENTRY = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;
const TITLE = "Split the wave editor's cell panel";
const MARK = "2026-09-10, claude/queue-split-the-wave-editors-cell-panel";

let root = "";
let first = "";

async function run(args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  const [out, err, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`git ${args.join(" ")}: ${err.trim()}`);
  return out.trim();
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-ref-"));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), ENTRY);
  await writeFile(join(root, "readme.md"), "one\n");
  await run(["add", "docs/queue.md", "readme.md"]);
  await run(["commit", "-q", "-m", "first"]);
  first = await run(["rev-parse", "HEAD"]);
  // The lane: the one checkout there is, with work of its own on it and a
  // queue file the session has been editing but not committed.
  await run(["checkout", "-q", "-b", "lane"]);
  await writeFile(join(root, "readme.md"), "two\n");
  await run(["commit", "-q", "--only", "readme.md", "-m", "the work"]);
  await writeFile(join(root, "docs", "queue.md"), `${ENTRY}\nA line the session typed.\n`);
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("commitOnRef", () => {
  it("puts the line on main as one commit over the old tip, from a lane", async () => {
    const made = commitOnRef(
      root,
      "main",
      "docs/queue.md",
      (md) => markTaken(md, TITLE, MARK),
      "Mark it taken",
    );
    expect(await run(["rev-parse", "main"])).toBe(made);
    expect(await run(["rev-parse", "main~1"])).toBe(first);
    expect(await run(["log", "-1", "--format=%s", "main"])).toBe("Mark it taken");
    const onMain = await run(["show", "main:docs/queue.md"]);
    expect(parseItems(`${onMain}\n`, "queue")[0]?.taken).toBe(MARK);
    // The rest of the tree rode along unchanged.
    expect(await run(["show", "main:readme.md"])).toBe("one");
  });

  it("leaves the lane, its index and its working tree exactly as they were", async () => {
    expect(await run(["rev-parse", "--abbrev-ref", "HEAD"])).toBe("lane");
    expect(await run(["log", "-1", "--format=%s"])).toBe("the work");
    expect(await run(["status", "--porcelain"])).toMatch(/^ ?M docs\/queue\.md$/);
    expect(await readFile(join(root, "docs", "queue.md"), "utf8")).toBe(
      `${ENTRY}\nA line the session typed.\n`,
    );
  });

  it("refuses a branch this clone does not have, rather than claiming on nothing", () => {
    expect(() => commitOnRef(root, "trunk", "docs/queue.md", (md) => md, "Mark it taken")).toThrow(
      /no such branch here/,
    );
  });

  it("refuses to overwrite a main that moved under it", async () => {
    // A second claim on the same entry is what `markTaken` itself refuses; a
    // moved ref is a race this guards with the old tip, so the check is on a
    // different edit of the same file.
    const before = await run(["rev-parse", "main"]);
    await run(["update-ref", "refs/heads/main", first]);
    expect(await run(["rev-parse", "main"])).toBe(first);
    // Move it back to the marked commit *during* the edit, so the tip read at
    // the start is stale by the time the ref is written.
    expect(() =>
      commitOnRef(
        root,
        "main",
        "docs/queue.md",
        (md) => {
          Bun.spawnSync(["git", "update-ref", "refs/heads/main", before], { cwd: root });
          return `${md}\nmoved\n`;
        },
        "Racing",
      ),
    ).toThrow(/could not move main/);
    expect(await run(["rev-parse", "main"])).toBe(before);
  });
});
