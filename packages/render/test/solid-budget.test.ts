import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { view } from "@neon-spore/content";
import { demoRig } from "../../../tools/raster/src/solid-demo.js";
import { drawRig } from "../src/index.js";
import { budgetRow } from "./budget-row.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * An op-count budget for **a rig drawn by `drawRig`**, on the demo rig the
 * solid sheet turns (`tools/raster/src/solid-demo.ts`): a long body, a tail in
 * two, two fins and a head. Each tube is sliced every few screen pixels
 * (`solid-tube-draw.ts`), and each slice is a fill under a section gradient,
 * so this is what a tube costs a frame and what holds it there. A tube drawn
 * thinner than `FINE_R_PX` is sliced more coarsely along its length; before
 * that the side was 130 fills a frame and the front 96. The section gradients
 * are shared between slices by `sectionGradient`'s cache, so a warm frame
 * builds a handful, not one a slice.
 *
 * Each row is the worst of each op over half a second of the rig breathing,
 * drawn at sixty frames a second at the sheet's size, from one side; the first
 * frame is left out, as it bakes what every later one reads. Set `MEASURE` to
 * true and run this file to print the rows as they are written below
 * (`budget-row.ts`); never committed as `true`.
 */
const MEASURE = false;

type Budget = Record<
  "fill" | "stroke" | "drawImage" | "createLinearGradient" | "createRadialGradient",
  number
>;

/** Name → where it is seen from, and the ceiling. */
const BUDGETS: Record<string, { yaw: number; pitch: number; budget: Budget }> = {
  side: {
    yaw: 0,
    pitch: 0,
    budget: {
      fill: 116,
      stroke: 5,
      drawImage: 3,
      createLinearGradient: 8,
      createRadialGradient: 5,
    },
  },
  "three-quarter, looked down on": {
    yaw: 0.785,
    pitch: 0.45,
    budget: {
      fill: 103,
      stroke: 5,
      drawImage: 3,
      createLinearGradient: 7,
      createRadialGradient: 5,
    },
  },
  front: {
    yaw: 1.571,
    pitch: 0.2,
    budget: {
      fill: 85,
      stroke: 5,
      drawImage: 3,
      createLinearGradient: 4,
      createRadialGradient: 6,
    },
  },
};

const LOOK = { deep: "#07060F", rim: "#C9B8FF", haze: 0.5 };
const FRAMES = 30;

beforeAll(installCanvasGlobals);

function worst(yaw: number, pitch: number): Map<string, number> {
  const { ctx } = stubCanvas();
  const most = new Map<string, number>();
  for (let frame = 0; frame < FRAMES; frame++) {
    ctx.tally.clear();
    const c = ctx as unknown as CanvasRenderingContext2D;
    drawRig(c, demoRig(frame / 60), view(yaw, pitch, 900), 180, 180, LOOK);
    if (frame >= 1) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
  }
  return most;
}

describe("a rig stays inside its measured budget", () => {
  for (const [name, { yaw, pitch, budget }] of Object.entries(BUDGETS)) {
    it(name, () => {
      const tally = worst(yaw, pitch);
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
