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
