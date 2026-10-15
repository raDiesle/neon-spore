import { describe, expect, it } from "bun:test";
import { type CpuProfile, foldProfile, topBy } from "../profile-fold.js";

/**
 * **The fold `bun run profile` prints** (`profile-fold.ts`), on a profile
 * written out by hand: a module calling `draw`, which calls `rimAt` and
 * recurses into itself once. Each sample lasts until the next, so the last has
 * no length; a recursive function is counted once a sample in its total.
 */

const frame = (functionName: string, line = 0) => ({
  functionName,
  url: functionName.startsWith("(") ? "" : "file:///repo/packages/render/src/knob.ts",
  lineNumber: line,
});

const PROFILE: CpuProfile = {
  nodes: [
    { id: 1, callFrame: frame("(root)"), children: [2] },
    { id: 2, callFrame: frame("(module)"), children: [3] },
    { id: 3, callFrame: frame("draw", 9), children: [4, 5] },
    { id: 4, callFrame: frame("rimAt", 41) },
    { id: 5, callFrame: frame("draw", 9), children: [6] },
    { id: 6, callFrame: frame("rimAt", 41) },
  ],
  // draw, rimAt, rimAt under the inner draw, draw, and a last with no length.
  samples: [3, 4, 6, 3, 4],
  timeDeltas: [0, 100, 300, 200, 50],
};

describe("foldProfile", () => {
  const folded = foldProfile(PROFILE, "/repo");
  const row = (name: string) => folded.rows.find((r) => r.name === name);

  it("weighs each sample by the time to the next, and drops the root", () => {
    expect(folded.sampledUs).toBe(100 + 300 + 200 + 50);
    expect(row("(root)")).toBeUndefined();
  });

  it("gives each function its own samples as self time", () => {
    expect(row("draw packages/render/src/knob.ts:10")?.selfUs).toBe(100 + 50);
    expect(row("rimAt packages/render/src/knob.ts:42")?.selfUs).toBe(300 + 200);
  });

  it("counts a recursive function once a sample in its total", () => {
    expect(row("draw packages/render/src/knob.ts:10")?.totalUs).toBe(folded.sampledUs);
    expect(row("(module)")?.totalUs).toBe(folded.sampledUs);
  });

  it("puts the hottest first, by self or by total", () => {
    expect(topBy(folded.rows, "selfUs", 1)[0]?.name).toBe("rimAt packages/render/src/knob.ts:42");
    expect(topBy(folded.rows, "totalUs", 3).map((r) => r.name)).toEqual([
      "(module)",
      "draw packages/render/src/knob.ts:10",
      "rimAt packages/render/src/knob.ts:42",
    ]);
  });
});
