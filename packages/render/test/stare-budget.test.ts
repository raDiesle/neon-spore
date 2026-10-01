import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { budgetRow } from "./budget-row.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * An op-count budget for **THE STARE with its eye open against shut**, on a
 * live beat. The owner, 29 September 2026: *when eye opens game seems to lag
 * on my mobile*.
 *
 * The rows say the ops are not why. Opening the eye adds one gradient and
 * one fill — the gaze (`drawGaze` in `stare-draw.ts`) — and three strokes,
 * and nothing else. The gaze is a plain alpha fill, with no blur and no
 * `lighter`; what it adds that the tally cannot see is area, a trapezoid
 * the width of the field and a third of its height. The simulation is not
 * why either: a tick with the eye open cost about 9 µs on the desktop on 30
 * September 2026. Drawing the gaze to a cached bitmap would fill the same
 * area, so it would buy nothing; a narrower beam fills less but changes the
 * frame, so it is a look for VERSUS rather than a fix. These rows only keep
 * the open frame from growing a cost the desktop *would* see.
 *
 * `drawImage` went from 29 to 30 in both rows on 1 October 2026, when the
 * globe was taken from VERSUS: its halos, round the ball and on its wet
 * point, are one cached sprite more than the flat eye drew.
 *
 * Each row is the worst of each op over one beat, on a phone. Set `MEASURE`
 * to true and run this file to print the rows as they are written below
 * (`budget-row.ts`); never committed as `true`.
 */
const MEASURE = false;

type Budget = Record<
  "fill" | "stroke" | "drawImage" | "createLinearGradient" | "createRadialGradient",
  number
>;

const BUDGETS: Record<string, { open: boolean; budget: Budget }> = {
  shut: {
    open: false,
    budget: {
      fill: 53,
      stroke: 120,
      drawImage: 30,
      createLinearGradient: 13,
      createRadialGradient: 7,
    },
  },
  open: {
    open: true,
    budget: {
      fill: 54,
      stroke: 123,
      drawImage: 30,
      createLinearGradient: 14,
      createRadialGradient: 7,
    },
  },
};

installCanvasGlobals();
const TPB = ticksPerBeat(CFG);

/** THE STARE hung over the field on a live beat, its eye as asked. */
function hung(open: boolean): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = stareBoss(world) as StareState;
  s.phase = "live";
  s.phaseBeat = world.beat - 1;
  s.open = open;
  return world;
}

function worst(open: boolean): Map<string, number> {
  const most = new Map<string, number>();
  runFrames(hung(open), "p1", TPB, {
    viewport: { width: 390, height: 844, dpr: 3 },
    onDrawn: (ctx, frame) => {
      if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
      ctx.tally.clear();
    },
  });
  return most;
}

describe("THE STARE's open eye stays inside its measured budget", () => {
  for (const [name, { open, budget }] of Object.entries(BUDGETS)) {
    it(name, () => {
      const tally = worst(open);
      if (MEASURE) {
        console.log(`  ${name}`, budgetRow(tally, budget));
        return;
      }
      for (const [key, max] of Object.entries(budget))
        expect(tally.get(key) ?? 0, `${name} ${key}`).toBeLessThanOrEqual(max);
    });
  }
  it("is not left measuring", () => expect(MEASURE).toBe(false));
});
