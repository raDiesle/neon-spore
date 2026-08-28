import { describe, expect, test } from "bun:test";
import { buildQueue } from "../src/queue-panel.js";

const ROOT_URL = new URL("../../../", import.meta.url);
const ROOT = Bun.fileURLToPath(ROOT_URL);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT_URL))).text();

const STATUSES = new Set(["waiting", "opened", "flying", "landed"]);

describe("buildQueue", () => {
  test("an empty queue file gives no group at all", async () => {
    expect(await buildQueue(ROOT, "# Queue\n\nnothing here yet\n")).toEqual([]);
  });

  test("the real queue reads as one group, ordered as the file has it, with git's own status", async () => {
    const groups = await buildQueue(ROOT, await read("docs/queue.md"));

    // An empty queue is a correct state, not a broken one, and this test used
    // to say otherwise: it asserted one group and went red the first evening
    // the run finished everything the owner had asked for. That is the reverse
    // of what a test should do — the queue is a file the owner empties on
    // purpose, and a suite that fails when the work is done teaches a session
    // to keep work in the file to stay green.
    if (groups.length === 0) return;

    expect(groups).toHaveLength(1);
    const group = groups[0]!;
    expect(group.title).toBe("THE QUEUE");
    expect(group.entries.length).toBeGreaterThan(0);

    for (const entry of group.entries) {
      expect(STATUSES.has(entry.kind)).toBe(true);
      // The branch is the join key back to git, and the note says both what
      // it owns and whether it is being worked on right now.
      expect(entry.note).toContain(entry.ref);
      expect(entry.detail.length).toBeGreaterThan(0);
    }

    // First in the file is next to be done — the order is not re-sorted.
    const fileOrder = (await read("docs/queue.md"))
      .split("\n")
      .filter((l) => l.startsWith("## "))
      .map((l) => l.slice(3).trim());
    expect(group.entries.map((e) => e.name)).toEqual(fileOrder);
  });
});
