import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  KEEL_ROCK_FROM_MILLI,
  keelBoss,
  keelThrown,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { AUTOPILOT_HANDS } from "../../hands/src/autopilot-hands.js";
import { keelRockNow, keelSegs } from "../src/keel-pose.js";
import { keelSegEnd } from "../src/keel-shape.js";
import { computeLayout, tileCY } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE KEEL's rock falls from the row the simulation meets it on**
 * (`sim/keel-shot.ts`): the tail's drawn end, which rocks with the spine's
 * breath, stays within a quarter of a row of `KEEL_ROCK_FROM_MILLI` for as
 * long as a rock is in the air, and the rock is on the simulation's row once
 * it has left the tail. A spine drawn higher or lower is red here first.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const TPB = ticksPerBeat(CFG);
const NEAR = 0.25;

describe("THE KEEL's rock", () => {
  it("leaves the tail near its simulated row and falls on it", () => {
    const world = createWorld({ ...CFG }, 5);
    const index = waveWith("keel");
    startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
    const hand = AUTOPILOT_HANDS.keel;
    if (hand === undefined) throw new Error("no hand plays THE KEEL");
    const from = tileCY(L, KEEL_ROCK_FROM_MILLI / 1000);
    let seen = 0;
    for (let n = 0; n < TPB * 400 && world.boss !== null; n++) {
      const s = keelBoss(world);
      if (s !== null && keelThrown(s)) {
        const phase = (world.tick % TPB) / TPB;
        const segs = keelSegs(L, CFG, s, world.beat, phase);
        const tail = segs[segs.length - 1];
        if (tail === undefined) throw new Error("a spine with no tail");
        const end = keelSegEnd(L, tail.centre, tail.slope, tail.pose, 1);
        expect(Math.abs(end.y - from) / L.tile).toBeLessThan(NEAR);
        const rock = keelRockNow(L, CFG, s, segs, world.beat, phase);
        if (world.beat - s.rockBeat === 0 && phase === 0) expect(rock?.y).toBeCloseTo(end.y, 5);
        seen++;
      }
      step(
        world,
        hand(world).map((p) => ({ ...p, tick: world.tick })),
      );
    }
    expect(seen).toBeGreaterThan(0);
  });
});
