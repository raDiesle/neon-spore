import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor } from "../claim.js";
import { markTaken, takenIn } from "../edit.js";
import { commitOnRef } from "../git.js";
import { type Item, parseItems } from "../queue.js";
import { claim } from "../repo.js";

/**
 * A claim whose push origin refuses, which is how §25 THE VALVE came to be
 * built twice on 26 September 2026 (`claim-push.ts`).
 *
 * Each clone here is shaped like a cloud session: one checkout standing on its
 * lane, and `main` a ref beside it that nothing has checked out. `ours` is
 * the session whose `main` fell behind. `theirs` pushes first, once with
 * ordinary work and once with its own claim on the same item.
 */

const QUEUE = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.

## Name the thing the lane found

- **Found:** 2026-09-10, hit-looks
- **Files:** \`tools/queue/repo.ts\`

Queued and worked in one sitting.
`;

let base = "";
let origin = "";
let ours = "";
let theirs = "";

function itemNamed(title: string): Item {
  const item = parseItems(QUEUE, "queue").find((i) => i.title === title);
  if (!item) throw new Error(`no ${title} in the fixture`);
  return item;
}

async function cloneAsLane(dir: string, lane: string): Promise<void> {
  await gitIn(["clone", "-q", origin, dir], base);
  await gitIn(["config", "user.email", "test@example.com"], dir);
  await gitIn(["config", "user.name", "Test"], dir);
  await gitIn(["checkout", "-q", "-b", lane], dir);
}

/** `theirs` puts a commit on origin's trunk, the way another session would. */
async function theyPush(edit: (md: string) => string, subject: string): Promise<void> {
  await gitIn(["fetch", "-q", "origin", "main"], theirs);
  await gitIn(["update-ref", "refs/heads/main", "origin/main"], theirs);
  commitOnRef(theirs, "main", "docs/queue.md", edit, subject);
  await gitIn(["push", "-q", "origin", "main:main"], theirs);
}

const onOrigin = (): Promise<string> => gitIn(["show", "main:docs/queue.md"], origin);

beforeAll(async () => {
  base = await mkdtemp(join(tmpdir(), "ns-queue-push-"));
  origin = join(base, "origin.git");
  const seed = join(base, "seed");
  await gitIn(["init", "--bare", "-q", "-b", "main", origin], base);
  await gitIn(["init", "-q", "-b", "main", seed], base);
  await gitIn(["config", "user.email", "test@example.com"], seed);
  await gitIn(["config", "user.name", "Test"], seed);
  await mkdir(join(seed, "docs"));
  await writeFile(join(seed, "docs", "queue.md"), QUEUE);
  await gitIn(["add", "docs/queue.md"], seed);
  await gitIn(["commit", "-q", "-m", "first"], seed);
  await gitIn(["push", "-q", origin, "main"], seed);
  ours = join(base, "ours");
  theirs = join(base, "theirs");
  await cloneAsLane(ours, "our-lane");
  await cloneAsLane(theirs, "their-lane");
}, repoTimeout(16));

afterAll(async () => {
  await rm(base, { recursive: true, force: true });
}, repoTimeout(2));

describe("a claim from a main that fell behind origin", () => {
  const item = itemNamed("Split the wave editor's cell panel");

  beforeAll(async () => {
    // Somebody else's landing: origin's trunk moves, and ours does not know.
    await theyPush((md) => `${md}\nA landing's line.\n`, "a landing");
    claim(item, ours);
  }, repoTimeout(20));

  it(
    "is marked again over origin's trunk and pushed",
    async () => {
      const md = await onOrigin();
      expect(md).toContain("A landing's line.");
      expect(takenIn(md, item.title)).toContain(`(claim: ${branchFor(item)})`);
    },
    repoTimeout(2),
  );

  it(
    "leaves this clone's main and the claim branch where origin's trunk is",
    async () => {
      await gitIn(["fetch", "-q", "origin", "main"], ours);
      const tip = await gitIn(["rev-parse", "origin/main"], ours);
      expect(await gitIn(["rev-parse", "main"], ours)).toBe(tip);
      expect(await gitIn(["rev-parse", branchFor(item)], ours)).toBe(tip);
    },
    repoTimeout(4),
  );
});

describe("a claim on an item another session took on origin first", () => {
  const item = itemNamed("Name the thing the lane found");
  const holder = "2026-09-26, claude/their-lane (claim: claude/queue-theirs)";
  let before = "";
  let thrown: unknown = null;

  beforeAll(async () => {
    before = await gitIn(["rev-parse", "main"], ours);
    await theyPush((md) => markTaken(md, item.title, holder), "their claim");
    try {
      claim(item, ours);
    } catch (e) {
      thrown = e;
    }
  }, repoTimeout(20));

  it(
    "throws with the holder's name",
    () => {
      expect(String(thrown)).toContain("already taken on origin");
      expect(String(thrown)).toContain(holder);
    },
    repoTimeout(1),
  );

  it(
    "takes its own mark back off main and its branch down",
    async () => {
      expect(await gitIn(["rev-parse", "main"], ours)).toBe(before);
      const heads = await gitIn(["for-each-ref", "--format=%(refname:short)", "refs/heads"], ours);
      expect(heads.split("\n")).not.toContain(branchFor(item));
      expect(takenIn(await onOrigin(), item.title)).toBe(holder);
    },
    repoTimeout(4),
  );
});
