import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { budgetRow } from "./budget-row.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, runFrames } from "./frame-harness.js";
import { acting, hung, TPB } from "./instar-kit.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * An op-count budget for **THE INSTAR's turn between its two views** — the
 * stretch of a morph where both `drawFront` and `drawProfile` are drawn
 * (`instarHandover`). It cost two to five times a still frame until the tubes
 * were sliced by their size on the screen and a view flown off the field was
 * left undrawn (`solid-tube-screen.ts`, `instar-reach.ts`); these rows hold it
 * there. The dive was 1390 draws and 302 gradients before.
 *
 * Each row is the worst of each op over one beat starting a third of the way
 * into the step's morph, on a phone. Set `MEASURE` to true and run this file
 * to print the rows as they are written below (`budget-row.ts`); never
 * committed as `true`.
 */
const MEASURE = false;

type Budget = Record<
  "fill" | "stroke" | "drawImage" | "createLinearGradient" | "createRadialGradient",
  number
>;

/** Step index and name → the ceiling. */
const BUDGETS: Record<string, { cursor: number; budget: Budget }> = {
  "13 coil": {
    cursor: 13,
    budget: {
      fill: 477,
      stroke: 513,
      drawImage: 30,
      createLinearGradient: 87,
      createRadialGradient: 40,
    },
  },
  "15 dive": {
    cursor: 15,
    budget: {
      fill: 440,
      stroke: 513,
      drawImage: 30,
      createLinearGradient: 57,
      createRadialGradient: 39,
    },
  },
  "20 roar": {
    cursor: 20,
    budget: {
      fill: 490,
      stroke: 524,
      drawImage: 32,
      createLinearGradient: 99,
      createRadialGradient: 39,
    },
  },
};

installCanvasGlobals();

function worst(cursor: number): Map<string, number> {
  const world = hung();
  const s = acting(world, cursor);
  s.phase = "morph";
  s.phaseBeat = world.beat - (s.steps[cursor]?.morphBeats ?? 0) * 0.3;
  const most = new Map<string, number>();
  runFrames(world, "p1", TPB, {
    viewport: { width: 390, height: 844, dpr: 3 },
    onDrawn: (ctx, frame) => {
      if (frame >= 2) for (const [k, v] of ctx.tally) most.set(k, Math.max(most.get(k) ?? 0, v));
      ctx.tally.clear();
    },
  });
  return most;
}

describe("THE INSTAR's turn stays inside its measured budget", () => {
  for (const [name, { cursor, budget }] of Object.entries(BUDGETS)) {
    it(name, () => {
      const tally = worst(cursor);
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
