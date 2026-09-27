import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitIn, repoTimeout } from "../../test/repo-time.js";
import { branchFor } from "../claim.js";
import { type Item, parseItems } from "../queue.js";
import { spentHere } from "../spent.js";
import { statusLines, statusOf } from "../status.js";

/**
 * A claim a lane on this machine landed and walked away from, as `status`
 * sees it. On 27 September 2026 `bun run queue status` said BUSY with ten
 * items, and seven were claim branches already on `main` with no worktree on
 * them; only `take` asked `spent.ts`, so each was found by hand.
 */

const ENTRY = `# Queue

## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Taken:** 2026-09-27, claude/queue-split-the-wave-editors-cell-panel
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.

## Finish the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Taken:** 2026-09-27, claude/queue-finish-the-wave-editors-cell-panel
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

const items = parseItems(ENTRY, "queue");
const [spentItem, liveItem] = items as [Item, Item];

let root = "";
const run = (args: string[]): Promise<string> => gitIn(args, root);
const spentOf = (i: Item) => spentHere(i, i.taken, root);

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "ns-queue-spent-status-"));
  await run(["init", "-b", "main", "--quiet"]);
  await run(["config", "user.email", "test@example.com"]);
  await run(["config", "user.name", "Test"]);
  await writeFile(join(root, "a.txt"), "a\n");
  await run(["add", "a.txt"]);
  await run(["commit", "-q", "-m", "first"]);
  // Both claim branches stand at the trunk's tip: landed, nothing of theirs left.
  await run(["branch", branchFor(spentItem)]);
  await run(["branch", branchFor(liveItem)]);
}, repoTimeout(8));

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
}, repoTimeout(2));

describe("status with a spent claim", () => {
  const refs = () => ["main", branchFor(spentItem), branchFor(liveItem)];

  it(
    "is not counted when the claim branch is on the trunk and no worktree holds it",
    () => {
      const status = statusOf([spentItem], refs(), undefined, "main", spentOf);
      expect(status.ongoing[0]?.spent).toEqual([branchFor(spentItem)]);
      expect(status.state).toBe("idle");
      const said = statusLines(status).join("\n");
      expect(said).toStartWith("IDLE");
      expect(said).toContain(`spent — bun run queue release ${JSON.stringify(spentItem.title)}`);
    },
    repoTimeout(4),
  );

  it(
    "is still BUSY for a claim a worktree stands on, and says the spent one apart",
    async () => {
      await run(["worktree", "add", "-q", join(root, "lane"), branchFor(liveItem)]);
      const status = statusOf(items, refs(), undefined, "main", spentOf);
      expect(status.state).toBe("busy");
      const lines = statusLines(status);
      expect(lines[0]).toStartWith("BUSY — 1 item is");
      expect(lines.join("\n")).toContain("1 spent claim");
    },
    repoTimeout(6),
  );

  it("counts every claim when nobody asks whether it is spent", () => {
    expect(statusOf(items, refs()).state).toBe("busy");
    expect(statusOf([spentItem], refs()).state).toBe("busy");
  });
});
