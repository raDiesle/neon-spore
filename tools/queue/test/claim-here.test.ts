import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { branchFor } from "../claim.js";
import { markTaken } from "../edit.js";
import { commitOnRef } from "../git.js";
import { type Item, parseItems } from "../queue.js";
import { claim, trunkHas } from "../repo.js";

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
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("trunkHas", () => {
  it("sees the entry main carries and not the one only the lane has", () => {
    const md = ON_MAIN + ONLY_HERE;
    expect(trunkHas(itemNamed(md, "Split the wave editor's cell panel"), root)).toBe(true);
    expect(trunkHas(itemNamed(md, "Name the thing the lane found"), root)).toBe(false);
  });
});

describe("a claim on an entry only the lane has", () => {
  const item = itemNamed(ON_MAIN + ONLY_HERE, "Name the thing the lane found");
  let branch = "";

  beforeAll(() => {
    branch = claim(item, root);
  });

  it("makes the branch, which is the gate the other worktrees read", async () => {
    expect(branch).toBe(branchFor(item));
    expect(await branches()).toContain(branch);
  });

  it("writes the Taken: line into the working copy", async () => {
    const md = await readFile(join(root, "docs", "queue.md"), "utf8");
    const marked = parseItems(md, "queue").find((i) => i.title === item.title);
    expect(marked?.taken).toMatch(new RegExp(`^\\d{4}-\\d{2}-\\d{2}, ${branch}$`));
  });

  it("leaves main exactly as it was, uncommitted and unpushed", async () => {
    expect(await run(["show", "main:docs/queue.md"])).toBe(ON_MAIN.trim());
    expect(await run(["rev-list", "--count", "main"])).toBe("1");
    expect(await run(["status", "--porcelain"])).toBe("M docs/queue.md");
  });
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
  });

  it("throws, and takes the branch it made back down with it", async () => {
    expect(() => claim(item, root)).toThrow(/already taken/);
    expect(await branches()).not.toContain(branchFor(item));
  });
});
