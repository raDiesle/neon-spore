import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, controlSet, WAVES } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, runFrames } from "./frame-harness.js";

/**
 * **THE CRAWLER's own op-count budget**, and its own file beside
 * `fleet-budget.test.ts` for that file's reason: the scene is different, not
 * the seat. `frame-budget.test.ts`'s busy field is three falling bodies, and a
 * worm is a run of five standing along one row — five contours, five necks and
 * five seams, all of them on the field at once and none of them ever off it.
 *
 * The owner's standing rule is that **a new shape gets a measurement**, on the
 * grounds that a shape which only appears in one wave is exactly the one whose
 * cost nobody has ever looked at. This is that measurement, stored so a later
 * run can be diffed against it rather than compared to a memory.
 *
 * **What it says today.** Against the same phone-sized frame the busy field is
 * weighed on, a whole worm costs about twenty more `new Path2D`, fifteen more
 * `fill` and five more `clip` — the slime is three fills inside a clip on every
 * ring (`crawler-skin.ts`), which is where the *alive* comes from and is the
 * dearest thing on this body.
 *
 * The Path2D count is the row worth watching: unlike the panel's sheet beside
 * it, it does **not** come down on the second frame, because every ring builds
 * its contour afresh every frame — `crawlerPath` returns a string that a
 * `Path2D` then parses (`content/crawler-shape.ts`). That is THE LID's
 * arrangement and it is cheap at one body; at nine rings it is nine of them.
 *
 * Every number is exact, measured after the change that earned it. If a
 * legitimate change raises one, remeasure and move that row — do not pad it.
 */

type Budget = Partial<
  Record<
    "fillRect" | "stroke" | "fill" | "clip" | "save" | "drawImage" | "new Path2D" | "fillText",
    number
  >
>;

const BUDGETS: Readonly<Record<"p1" | "p2", readonly Budget[]>> = {
  p1: [
    { fillRect: 66, stroke: 40, fill: 41, clip: 10, save: 23, "new Path2D": 45, fillText: 4 },
    { fillRect: 66, stroke: 42, fill: 41, clip: 10, save: 23, "new Path2D": 31, fillText: 4 },
  ],
  p2: [
    { fillRect: 66, stroke: 48, fill: 47, clip: 10, save: 25, "new Path2D": 47, fillText: 2 },
    { fillRect: 66, stroke: 50, fill: 47, clip: 10, save: 25, "new Path2D": 31, fillText: 2 },
  ],
};

/**
 * THE CRAWLER's wave, stepped to a tick where a whole worm stands on the field.
 *
 * Twenty beats in: the first worm has fed its whole length on and has not yet
 * reached the far wall, so all five of its links are in columns the field
 * draws. Measured on an *entered and played* wave rather than on its first
 * frame, which is the owner's other standing instruction — a wave still behind
 * its briefing reads as zero bodies and produces a number about nothing.
 *
 * The wave is found by id, not by index: a number here would be a hidden claim
 * about the order of the whole campaign (`Wave.id`).
 */
function wormWorld(): World {
  const world = createWorld(CFG, 3, []);
  const index = WAVES.findIndex((w) => w.id === "theCrawler");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let t = 0; t < ticksPerBeat(CFG) * 20; t++) step(world, []);
  return world;
}

describe("a whole worm's op count", () => {
  it("has five links standing on the field to be weighed", () => {
    const world = wormWorld();
    expect(world.creatures.filter((c) => c.kind === "crawler")).toHaveLength(5);
  });

  for (const role of ["p1", "p2"] as const) {
    it(`stays inside the measured budget for two consecutive frames on ${role}`, () => {
      installCanvasGlobals();
      const world = wormWorld();
      const rows = BUDGETS[role];
      let measured = 0;
      runFrames(world, role as ViewRole, rows.length * 4, {
        viewport: { width: 390, height: 844, dpr: 3 },
        controls: controlSet("default"),
        onDrawn: (ctx, frame) => {
          const budget = rows[frame] as Budget;
          for (const [key, max] of Object.entries(budget)) {
            expect(ctx.tally.get(key) ?? 0, `${role} frame ${frame} ${key}`).toBeLessThanOrEqual(
              max as number,
            );
          }
          ctx.tally.clear();
          measured++;
        },
      });
      expect(measured).toBe(rows.length);
    });
  }
});
