import { describe, expect, test } from "bun:test";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { liveClaims, partitionMerged } from "../claims.js";

/**
 * The failure this guards is silent and expensive: a claim branch carries no
 * commits, so it points at `main` and `git branch --merged` offers it up to
 * every landing that happens anywhere in the repository.
 */
describe("partitionMerged", () => {
  test("another lane's queue claim survives this landing", () => {
    const merged = ["claude/queue-split-stage-test", "claude/some-lane"];
    expect(partitionMerged(merged, "claude/some-lane")).toEqual({
      spent: ["claude/some-lane"],
      claims: ["claude/queue-split-stage-test"],
    });
  });

  test("the claim being landed is swept, which is what releases the item", () => {
    const merged = ["claude/queue-a", "claude/queue-b"];
    expect(partitionMerged(merged, "claude/queue-a")).toEqual({
      spent: ["claude/queue-a"],
      claims: ["claude/queue-b"],
    });
  });

  test("a branch that merely starts with claude/ is not a claim", () => {
    expect(partitionMerged(["claude/queuey-thing"], "claude/x").spent).toEqual([
      "claude/queuey-thing",
    ]);
  });

  test("order is kept, so the log reads in the order git listed them", () => {
    const merged = ["a", "claude/queue-1", "b", "claude/queue-2", "c"];
    const { spent, claims } = partitionMerged(merged, "b");
    expect(spent).toEqual(["a", "b", "c"]);
    expect(claims).toEqual(["claude/queue-1", "claude/queue-2"]);
  });

  test("nothing merged is nothing swept", () => {
    expect(partitionMerged([], "claude/x")).toEqual({ spent: [], claims: [] });
  });
});

/**
 * The second half of a claim. A branch whose entry `bun run queue done` has
 * already removed is a husk — nobody is on it, and `bun run queue release`
 * cannot give it back, so only a landing can take it away.
 */
describe("partitionMerged, told which entries the queue still holds", () => {
  test("a claim with no entry behind it is spent", () => {
    const merged = ["claude/queue-drained", "claude/queue-held"];
    const live = new Set(["claude/queue-held"]);
    expect(partitionMerged(merged, "claude/some-lane", live)).toEqual({
      spent: ["claude/queue-drained"],
      claims: ["claude/queue-held"],
    });
  });

  test("an empty queue holds nothing, so every claim branch is spent", () => {
    const merged = ["claude/queue-a", "claude/queue-b"];
    expect(partitionMerged(merged, "claude/x", new Set()).claims).toEqual([]);
  });

  test("a queue that could not be read protects every claim", () => {
    const merged = ["claude/queue-a", "claude/queue-b"];
    expect(partitionMerged(merged, "claude/x", undefined).claims).toEqual([
      "claude/queue-a",
      "claude/queue-b",
    ]);
  });

  test("the claim being landed is still swept, entry or no entry", () => {
    const live = new Set(["claude/queue-a", "claude/queue-b"]);
    expect(partitionMerged(["claude/queue-a", "claude/queue-b"], "claude/queue-a", live)).toEqual({
      spent: ["claude/queue-a"],
      claims: ["claude/queue-b"],
    });
  });
});

/**
 * The set is read off the two files themselves, so an entry renamed or removed
 * changes what the sweep protects without anybody editing the sweep.
 */
describe("liveClaims", () => {
  test("names the branch each entry would be claimed under", async () => {
    const dir = join(tmpdir(), `claims-live-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    await mkdir(join(dir, "docs"), { recursive: true });
    await Bun.write(
      join(dir, "docs", "queue.md"),
      "## Split stage test\n\n- **Found:** 2026-09-03, claude/x\n- **Files:** `a.ts`\n\nDo the thing.\n",
    );
    await Bun.write(
      join(dir, "docs", "parked.md"),
      "## Half a migration\n\n- **Found:** 2026-09-04, claude/y\n- **Files:** `b.ts`\n\nThree files of five.\n",
    );
    const live = await liveClaims(dir);
    expect(live).toEqual(
      new Set(["claude/queue-split-stage-test", "claude/queue-half-a-migration"]),
    );
    await rm(dir, { recursive: true, force: true });
  });

  test("a missing file is undefined, which protects every claim", async () => {
    expect(await liveClaims(join(tmpdir(), "claims-live-nothing-here"))).toBeUndefined();
  });
});
