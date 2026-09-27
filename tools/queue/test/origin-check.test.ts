import { describe, expect, it } from "bun:test";
import { branchFor } from "../claim.js";
import { markTaken } from "../edit.js";
import { originRefusal } from "../origin-check.js";
import { parseItems } from "../queue.js";

/**
 * `next` and `take` ask `origin/main` before they claim (`origin-check.ts`):
 * a cloud session's claim on 26 September 2026 was invisible to a session
 * whose trunk had not been fetched, and the same boss was built twice.
 */

const MD = `# Queue

## §34 THE CYST — the simulation lane

- **Found:** 2026-09-26, this session
- **Files:** \`docs/spec/bosses-choreographed.md\`

Build it.
`;

const [item] = parseItems(MD, "queue");
if (!item) throw new Error("the fixture has no entry");
const CLOUD = "2026-09-26, claude/cyst-sim-cloud";
const taken = markTaken(MD, item.title, CLOUD);
const view = (queue: string | null) => ({ queue, parked: null });

describe("what origin says about an item", () => {
  it("refuses one origin marks taken by another branch, naming it", () => {
    const why = originRefusal(item, view(taken), true, "claude/local", "");
    expect(why).toContain("claude/cyst-sim-cloud");
  });

  it("refuses one origin has finished while this trunk still lists it", () => {
    expect(originRefusal(item, view("# Queue\n"), true, "claude/local", "")).toContain("done");
  });

  it("lets through an entry only this lane has filed", () => {
    expect(originRefusal(item, view("# Queue\n"), false, "claude/local", "")).toBeUndefined();
  });

  it("lets through a free entry, and one origin could not be read for", () => {
    expect(originRefusal(item, view(MD), true, "claude/local", "")).toBeUndefined();
    expect(originRefusal(item, view(null), true, "claude/local", "")).toBeUndefined();
  });

  it("lets through the caller's own claim, and a mark this checkout already judged", () => {
    const mine = markTaken(MD, item.title, `2026-09-26, ${branchFor(item)}`);
    expect(originRefusal(item, view(mine), true, branchFor(item), "")).toBeUndefined();
    expect(originRefusal(item, view(taken), true, "claude/local", CLOUD)).toBeUndefined();
  });
});
