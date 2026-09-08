import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { isTreeMove, lockStamp } from "../tree-moves.js";

describe("what counts as the tree moving", () => {
  test("the index and the heads do", () => {
    expect(isTreeMove("index")).toBe(true);
    expect(isTreeMove("ORIG_HEAD")).toBe(true);
  });

  test("the reflog does not, however its name ends", () => {
    expect(isTreeMove("logs/HEAD")).toBe(false);
  });
});

describe("noticing that dependencies arrived with a git operation", () => {
  test("a tree with no lockfile has no stamp to compare", () => {
    expect(lockStamp(mkdtempSync(join(tmpdir(), "ns-lock-")))).toBeUndefined();
  });

  test("a rewritten lockfile stamps differently from the one before", () => {
    const root = mkdtempSync(join(tmpdir(), "ns-lock-"));
    writeFileSync(join(root, "bun.lock"), "{}");
    const before = lockStamp(root);
    expect(before).toBeString();
    writeFileSync(join(root, "bun.lock"), '{ "workspaces": {} }');
    expect(lockStamp(root)).not.toBe(before);
  });
});
