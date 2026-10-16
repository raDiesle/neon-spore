import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat } from "@neon-spore/sim";
import { BUDGET_SKY } from "./budget-row.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";

/**
 * **Renumbering a wave moves no budget row.** The field's back is the wave's
 * sky, picked by the wave's number (`skyFor`), so a block put in early moved
 * every later budgeted wave under another sky and its row by the sky's ops —
 * eleven tables in one day (`docs/queue.md`, 16 October 2026). The budget runs
 * draw under one sky (`BUDGET_SKY`); here the same field is drawn at two wave
 * numbers, and it costs the same under the pin and not without it.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
installCanvasGlobals();

/** Every op over two frames of wave one's field, drawn as if it were wave `wave`. */
function tallyAt(wave: number, sky: number | undefined): Record<string, number> {
  const world = createWorld(CFG, 3);
  startWave(world, 0, buildQueue(0, CFG.cols), [], buildBoss(0, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG); i++) step(world, []);
  world.wave = wave;
  const sum: Record<string, number> = {};
  runFrames(world, "p1", 2, {
    sky,
    viewport: { width: 390, height: 844, dpr: 3 },
    onDrawn: (ctx) => {
      for (const [k, v] of ctx.tally) sum[k] = (sum[k] ?? 0) + v;
      ctx.tally.clear();
    },
  });
  return sum;
}

describe("the budget runs' sky", () => {
  // The first field drawn bakes what every later one reuses.
  tallyAt(0, BUDGET_SKY);

  it("is one sky whatever the wave's number", () => {
    expect(tallyAt(1, BUDGET_SKY)).toEqual(tallyAt(2, BUDGET_SKY));
  });

  it("is a pin that matters: unpinned, the two numbers draw different skies", () => {
    tallyAt(1, undefined);
    tallyAt(2, undefined);
    expect(tallyAt(1, undefined)).not.toEqual(tallyAt(2, undefined));
  });
});
