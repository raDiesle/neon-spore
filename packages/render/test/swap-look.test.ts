import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  type PlacedFault,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { seatBefore, swapChangeProgress, swapWarnProgress, swapWords } from "../src/swap-look.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE SWAP on the screen: the countdown the shipped plate says, the two
 * progress figures every candidate look is drawn from, and a whole run of
 * changes drawn for every seat (`swap-look.ts`).
 */

const TPB = ticksPerBeat(CFG);
const WARN = CFG.swapWarnBeats;
const EVERY = CFG.swapEveryBeats;
const AT = WARN + 2;

function swapWorld(): World {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 3);
  startWave(world, 0, [], [], null, false, 0, [
    { kind: "swap", at: AT, beats: EVERY * 2 } as PlacedFault,
  ]);
  return world;
}

/** A few ticks into the fault's `step`th beat. */
function atStep(s: number): World {
  const world = swapWorld();
  for (let t = 0; t <= (s + 1) * TPB + 4; t++) step(world, []);
  return world;
}

describe("THE SWAP's countdown", () => {
  it("says nothing before the warning, counts it down, and is quiet after the change", () => {
    expect(swapWords(atStep(AT - WARN - 1))).toBeNull();
    expect(swapWords(atStep(AT - WARN))).toBe(`PANELS SWAP IN ${WARN}`);
    expect(swapWords(atStep(AT - 1))).toBe("PANELS SWAP IN 1");
    expect(swapWords(atStep(AT))).toBeNull();
  });

  it("grows across the warning and runs across the beat after the change", () => {
    expect(swapWarnProgress(atStep(AT - WARN - 1), 0)).toBeNull();
    expect(swapWarnProgress(atStep(AT - WARN), 0)).toBe(0);
    expect(swapWarnProgress(atStep(AT - 1), 0.99)).toBeCloseTo(1, 1);
    expect(swapChangeProgress(atStep(AT), 0.5, 1)).toBe(0.5);
    expect(swapChangeProgress(atStep(AT + 1), 0.5, 1)).toBeNull();
  });

  it("knows the other form only for the two seats", () => {
    expect(seatBefore("p1")).toBe("p2");
    expect(seatBefore("p2")).toBe("p1");
    expect(seatBefore("test")).toBeNull();
  });
});

describe("the frames", () => {
  for (const role of ROLES) {
    it(`draws two changes for ${role} without the canvas refusing a value`, () => {
      const { ctx } = runFrames(swapWorld(), role, (AT + EVERY + 3) * TPB, { every: 9 });
      expect(ctx.calls).toBeGreaterThan(0);
    });
  }
});
