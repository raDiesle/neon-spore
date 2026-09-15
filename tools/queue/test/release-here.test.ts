import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearTaken, markTaken } from "../edit.js";
import { commitOnRef } from "../git.js";
import { type Item, parseItems } from "../queue.js";
import { alsoHere, trunkTaken } from "../repo.js";

/**
 * Giving a claim back, in the shape a cloud session makes one.
 *
 * `take` there writes the `Taken:` line onto the `main` ref and does not touch
 * the working tree (`repo.ts`, `onTrunk`), so the lane's own copy of
 * `docs/queue.md` never carries the mark. On 15 September 2026 `release` asked
 * that copy whether the item was marked, found nothing, left the line standing
 * on `main`, and `bun run queue status` went on reporting an item as taken by a
 * branch that had already been deleted. The two halves of the fix are here: the
 * trunk's copy is what is asked, and the working copy is edited too — because a
 * lane that is holding its own `docs/queue.md` puts the line straight back the
 * moment its landing rebases over the give-back.
 */

const ENTRY = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const TITLE = "Split the wave editor's cell panel";
const MARK = "2026-09-15, claude/queue-split-the-wave-editors-cell-panel";

let root = "";

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

function itemNamed(md: string, title: string): Item {
  const item = parseItems(md, "queue").find((i) => i.title === title);
  if (!item) throw new Error(`no ${title} in the fixture`);
  return item;
}

async function here(): Promise<string> {
  return await readFile(join(root, "docs", "queue.md"), "utf8");
}

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-release-"));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await mkdir(join(root, "docs"));
  await writeFile(join(root, "docs", "queue.md"), ENTRY);
  await run(["add", "docs/queue.md"]);
  await run(["commit", "-q", "-m", "first"]);
  // The lane, standing beside a trunk that is only a ref — the ordinary shape
  // of a cloud session (`docs/cloud-session.md`).
  await run(["checkout", "-q", "-b", "lane"]);
  // The claim a cloud `take` makes: onto the ref, with the working tree left
  // exactly as it was.
  commitOnRef(root, "main", "docs/queue.md", (md) => markTaken(md, TITLE, MARK), "taken");
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("the mark on the trunk", () => {
  it("is found although this checkout's own copy has no such line", async () => {
    expect(itemNamed(await here(), TITLE).taken).toBe("");
    expect(trunkTaken(itemNamed(await here(), TITLE), root)).toBe(MARK);
  });

  it("is nothing for an item nobody has taken", () => {
    const item = { ...itemNamed(ENTRY, TITLE), title: "Something else entirely" };
    expect(trunkTaken(item, root)).toBe("");
  });
});

describe("the same edit in this checkout's copy", () => {
  it("takes out a line the working copy is carrying", async () => {
    const item = itemNamed(ENTRY, TITLE);
    await writeFile(join(root, "docs", "queue.md"), markTaken(ENTRY, TITLE, MARK));
    alsoHere(item, (md) => clearTaken(md, TITLE), root);
    expect(itemNamed(await here(), TITLE).taken).toBe("");
  });

  it("leaves a copy that has nothing to change exactly as it was", async () => {
    const item = itemNamed(ENTRY, TITLE);
    await writeFile(join(root, "docs", "queue.md"), ENTRY);
    alsoHere(item, (md) => clearTaken(md, TITLE), root);
    expect(await here()).toBe(ENTRY);
  });

  /** A lane whose copy does not carry the entry at all — it was queued after
   * the lane branched — is not the place to be editing, and `clearTaken` would
   * throw on a title it cannot find. */
  it("says nothing about an entry this copy has not got", async () => {
    const item = { ...itemNamed(ENTRY, TITLE), title: "Queued after this lane branched" };
    await writeFile(join(root, "docs", "queue.md"), ENTRY);
    expect(() => alsoHere(item, (md) => clearTaken(md, item.title), root)).not.toThrow();
    expect(await here()).toBe(ENTRY);
  });
});
