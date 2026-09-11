import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet, WAVES } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { budgetRow } from "./budget-row.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

// The cap this file runs under. Asked for here rather than inherited: bun
// applies `setDefaultTimeout` to the file the call is in, and the harness is
// evaluated once, so a call left there reaches only whichever frame test
// imported it first (`frame-harness.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

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
 * weighed on, a whole worm costs about twenty-five more `new Path2D`, fifteen
 * more `fill` and five more `clip` — the slime is three fills inside a clip on
 * every ring (`crawler-skin.ts`), which is where the *alive* comes from and is
 * the dearest thing on this body.
 *
 * The Path2D count is the row worth watching, and **it comes down on the
 * second frame now**, which for most of this file's life it did not. The
 * squeeze that shapes a ring used to be a continuous sine of the shared clock
 * — a value no two frames agree about, so there was no key to cache a contour
 * under and every ring rebuilt its own every frame. The `crawler:pulse` slot
 * put that to a vote, the owner could not tell the stepped side from the
 * gliding one, and sixteen positions shipped: a ring's contour is now baked
 * per tile, part, heading and step (`crawler-ring.ts`). Four of the five
 * links are free by the second frame, and the row fell from 36 to 32 on both
 * seats. The first frame is unchanged, because a cold cache bakes what it is
 * asked for.
 *
 * The ring also no longer pays the round trip through text — `crawlerPoints`
 * hands its outline to `spline.ts`, which writes the curve into the `Path2D`
 * as numbers instead of formatting an SVG string for a parser to read back.
 *
 * **PEARL moved every row of this table on 9 September 2026**, and it is the
 * largest single move any of them has had. The wet on a ring is no longer three
 * ellipses in picture coordinates but a ball: a baked terminator, eight pores
 * placed at fixed longitudes of which about half are drawn, and one specular
 * (`crawler-skin.ts`). `fill` went from 41 to 53 on the pilot and `save` from
 * 34 to 56, which is four pores a ring across five rings, each in a transform
 * of its own. `new Path2D` went the other way and **fell**, from 54 to 39: a
 * pore is drawn with `beginPath` rather than allocated, and the three ellipses
 * it replaced were three allocations a ring. The `clip` and one of the two
 * strokes are the ship rather than the worm — `hull-barrel.ts` clips the
 * membrane and strokes a crown along it, which every frame in every budget file
 * now carries.
 *
 * **The marks cost twenty strokes and nine saves, and both were paid on
 * purpose** (`crawler-marks.ts`). `strokeGlow` is four strokes, so a crosshair
 * per ring is four per ring — which is why the shield's dome is appended to
 * the crosshair's own path instead of being stroked separately, and why the
 * marks are one glow rather than two. The saves are the other half of the same
 * change: the depth envelope moved from one transform around the whole run to
 * one per ring, because a scale about the canvas origin does not enlarge a
 * worm, it slides it (`drawLink`).
 *
 * **GUT moved the `fill` row by ten on 10 September 2026** and nothing else.
 * The owner took it over the pores: the organ, its rim of light and the wet
 * are fills inside the same clip the pores used, two more a ring across five
 * rings, and nothing on it is a transform of its own, so `save` stood still
 * (`crawler-gut.ts`).
 *
 * Every number is exact, measured after the change that earned it. If a
 * legitimate change raises one, remeasure and move that row — do not pad it.
 * Set `MEASURE` to true and run this file: each row is printed as the object
 * literal below, in the same order, so it goes back by being pasted rather
 * than read off and retyped (`budget-row.ts`).
 */

type Budget = Partial<
  Record<
    "fillRect" | "stroke" | "fill" | "clip" | "save" | "drawImage" | "new Path2D" | "fillText",
    number
  >
>;

/**
 * Dump each measured row instead of asserting it, as the object literal the
 * table below holds — so a remeasurement is a run and a paste rather than an
 * hour of hand-editing (`budget-row.ts`). Never committed as `true`.
 *
 * **Two interiors moved every row here on 9 September 2026.** THE SLICK's two
 * dots became a nucleus with nine veins and a bright running out along them,
 * and THE BULB's one dot became eleven spheres packed three shells deep
 * (`body-bloom.ts`, `body-spores.ts`). Both are on more waves than anything
 * else in the game, so every scene in this package carries them.
 *
 * The rows moved by a fraction of what the two candidates cost as candidates.
 * Drawn the way a tool draws one body, they were thirty-eight ops a slick and
 * thirty-three a bulb; batched by quantised brightness — `eye-iris.ts`'s *one
 * path and one stroke, not nine* — they are eight and five, and a spore is an
 * ellipse rather than a circle under a transform, which is where its saves
 * went.
 */
const MEASURE = false;

// Every row moved on 11 September 2026, when the owner took GLAND out of
// `ship:body`: the rail is a spine with a filled node per column instead of a
// bar per column, so `fillRect` fell by ten and `fill` rose; each button is an
// organ with veins and a beaded cord, and the hull carries seven ribs through
// the chamber — which is where the extra strokes and paths come from
// (`ship-gland.ts`). Then the second-frame `new Path2D` fell back by ten and
// `fill` by nine: the spine's cord, its stations as one path and its node, and
// each organ's bed, are held between frames the way the trough's channel was
// (`gland-fluid.ts`, `gland-organ.ts`). Remeasured, not padded.
const BUDGETS: Readonly<Record<"p1" | "p2", readonly Budget[]>> = {
  p1: [
    { fillRect: 55, stroke: 96, fill: 98, clip: 11, save: 68, "new Path2D": 56, fillText: 2 },
    { fillRect: 55, stroke: 98, fill: 95, clip: 11, save: 65, "new Path2D": 27, fillText: 2 },
  ],
  p2: [
    { fillRect: 55, stroke: 100, fill: 106, clip: 11, save: 70, "new Path2D": 54, fillText: 2 },
    { fillRect: 55, stroke: 102, fill: 103, clip: 11, save: 67, "new Path2D": 27, fillText: 2 },
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
          if (MEASURE) {
            console.log(`  ${role} frame ${frame}`, budgetRow(ctx.tally, budget));
          } else {
            for (const [key, max] of Object.entries(budget)) {
              expect(ctx.tally.get(key) ?? 0, `${role} frame ${frame} ${key}`).toBeLessThanOrEqual(
                max as number,
              );
            }
          }
          ctx.tally.clear();
          measured++;
        },
      });
      expect(measured).toBe(rows.length);
      // And the switch above is a switch for one run, never a commit: a file
      // left in measure mode asserts nothing at all, which is the one way this
      // convenience could quietly turn four budgets off (`fleet-budget.test.ts`
      // has carried this line since it had the only switch).
      expect(MEASURE, "MEASURE is left true").toBe(false);
    });
  }
});
