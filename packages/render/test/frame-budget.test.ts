import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, runFrames } from "./frame-harness.js";

/**
 * An op-count budget, not a frame-rate one — see `.claude/skills/render-perf`.
 * `ctx.tally` counts every canvas call a frame made; this pins the count so a
 * change that adds work back (a gradient rebuilt every frame, a clip opened
 * twice) fails a test instead of a phone.
 *
 * Two frames, not one: several of the savings pinned here only pay off from
 * the *second* frame onward — `gradient-slot.ts`'s cached gradients, and the
 * fire buttons' silhouette paths — so a budget built on frame 1 alone would
 * let them regress silently. Both seats, not one: the fire buttons are on
 * player 2's panel, and player 1's budget would never notice either of them
 * coming back. Every row is an exact number measured after the change that
 * earned it, not padded — lower them whenever a further saving lands, in the
 * same commit as the change.
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

// Wave 2, stepped to its first tick with 3+ creatures on the field, a
// phone-sized 390x844 dpr 3 stage — busy enough that every pass in
// `frame-passes.ts` has something to draw. Each seat runs its own world, so
// its two rows are consecutive frames of the same run.
const BUDGETS: Readonly<Record<"p1" | "p2", readonly Budget[]>> = {
  p1: [
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
  ],
  p2: [
    {
      fillRect: 64,
      stroke: 35,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 20,
      createLinearGradient: 8,
      createRadialGradient: 2,
      "new Path2D": 9,
      fillText: 2,
    },
    {
      fillRect: 64,
      stroke: 37,
      fill: 22,
      clip: 3,
      save: 21,
      drawImage: 20,
      createLinearGradient: 4,
      createRadialGradient: 1,
      // Two fewer than frame 0, and the two are the fire buttons' silhouettes:
      // every argument to them is a constant of the colour, so `controls.ts`
      // keeps the two paths rather than rebuilding both every frame.
      "new Path2D": 7,
      fillText: 2,
    },
  ],
};

describe("a busy frame's op count", () => {
  for (const role of ["p1", "p2"] as const) {
    it(`stays inside the measured budget for two consecutive frames on ${role}`, () => {
      installCanvasGlobals();
      const world = createWorld(CFG, 3, []);
      const index = 2;
      startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
      while (world.creatures.length < 3) step(world, []);

      const rows = BUDGETS[role];
      let measured = 0;
      runFrames(world, role as ViewRole, rows.length * 4, {
        viewport: { width: 390, height: 844, dpr: 3 },
        onDrawn: (ctx, frame) => {
          const budget = rows[frame] as Budget;
          for (const [key, max] of Object.entries(budget)) {
            expect(ctx.tally.get(key) ?? 0, `${role} frame ${frame} ${key}`).toBeLessThanOrEqual(
              max as number,
            );
          }
          // Zeroed between frames: each row is one frame's own count, and the
          // second row is lower only because the first left the caches warm.
          ctx.tally.clear();
          measured++;
        },
      });
      // Both rows were actually weighed: a run that drew one frame would let
      // the second budget pass by never being asked.
      expect(measured).toBe(rows.length);
    });
  }
});
