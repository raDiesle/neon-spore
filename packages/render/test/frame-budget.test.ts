import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step } from "@neon-spore/sim";
import { CFG, installCanvasGlobals, runFrames } from "./frame-harness.js";

/**
 * An op-count budget, not a frame-rate one — see `.claude/skills/render-perf`.
 * `ctx.tally` counts every canvas call a frame made; this pins the count so a
 * change that adds work back (a gradient rebuilt every frame, a clip opened
 * twice) fails a test instead of a phone.
 *
 * Two frames, not one: several of the savings in this lane (`gradient-slot.ts`)
 * only pay off from the *second* frame onward, so a budget built on frame 1
 * alone would let that saving regress silently. Both rows are exact numbers
 * measured after the change that earned them, not padded — lower them
 * whenever a further saving lands, in the same commit as the change.
 *
 * If a legitimate change to the scene raises one of these, remeasure with
 * `ctx.tally` (log it, or `console.log(ctx.tally)` in a scratch run of this
 * same setup) and update the row that changed — do not pad it "to be safe".
 */

type Budget = Partial<
  Record<
    | "fillRect"
    | "stroke"
    | "fill"
    | "clip"
    | "save"
    | "drawImage"
    | "createLinearGradient"
    | "createRadialGradient"
    | "new Path2D"
    | "fillText",
    number
  >
>;

// Wave 2, stepped to its first tick with 3+ creatures on the field, role p1,
// a phone-sized 390x844 dpr 3 stage — busy enough that every pass in
// `frame-passes.ts` has something to draw.
const BUDGETS: readonly Budget[] = [
  {
    fillRect: 64,
    stroke: 35,
    fill: 20,
    clip: 3,
    save: 17,
    drawImage: 18,
    createLinearGradient: 8,
    createRadialGradient: 2,
    "new Path2D": 7,
    fillText: 4,
  },
  {
    fillRect: 64,
    stroke: 37,
    fill: 20,
    clip: 3,
    save: 17,
    drawImage: 18,
    // Down from frame 0: the layout-only gradients (`gradient-slot.ts`'s
    // sites in field.ts and backdrop.ts, and key-light.ts's own slot) are
    // cache hits from the second frame on.
    createLinearGradient: 4,
    createRadialGradient: 1,
    "new Path2D": 7,
    fillText: 4,
  },
];

describe("a busy frame's op count", () => {
  it("stays inside the measured budget for two consecutive frames", () => {
    installCanvasGlobals();
    const world = createWorld(CFG, 3, []);
    const index = 2;
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    while (world.creatures.length < 3) step(world, []);

    let measured = 0;
    runFrames(world, "p1", BUDGETS.length * 4, {
      viewport: { width: 390, height: 844, dpr: 3 },
      onDrawn: (ctx, frame) => {
        const budget = BUDGETS[frame] as Budget;
        for (const [key, max] of Object.entries(budget)) {
          expect(ctx.tally.get(key) ?? 0).toBeLessThanOrEqual(max as number);
        }
        // Zeroed between frames: each row is one frame's own count, and the
        // second row is lower only because the first left the caches warm.
        ctx.tally.clear();
        measured++;
      },
    });
    // Both rows were actually weighed: a run that drew one frame would let the
    // second budget pass by never being asked.
    expect(measured).toBe(BUDGETS.length);
  });
});
