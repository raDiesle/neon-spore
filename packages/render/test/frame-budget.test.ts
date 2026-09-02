import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

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

const CFG = DEFAULT_CONFIG;

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
    const { canvas, ctx } = stubCanvas();
    const renderer = new Canvas2DRenderer(canvas);
    renderer.resize({ width: 390, height: 844, dpr: 3 });

    const world = createWorld(CFG, 3, []);
    const index = 2;
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    while (world.creatures.length < 3) step(world, []);

    const tpb = ticksPerBeat(CFG);
    for (const [i, budget] of BUDGETS.entries()) {
      ctx.tally.clear();
      for (let t = 0; t < 4; t++) step(world, []);
      renderer.draw({
        world,
        beatPhase: (world.tick % tpb) / tpb,
        role: "p1",
        time: (i * 4) / CFG.tickHz,
        dt: 4 / CFG.tickHz,
        events: world.events,
        running: true,
      });
      for (const [key, max] of Object.entries(budget)) {
        expect(ctx.tally.get(key) ?? 0).toBeLessThanOrEqual(max as number);
      }
    }
  });
});
