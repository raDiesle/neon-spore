import { describe, expect, test } from "bun:test";
import { partitionMerged } from "../claims.js";

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
