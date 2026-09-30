import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  gimbalBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { gimbalCues } from "../src/boss-cue-read-y.js";
import { fieldX } from "../src/field-flip.js";
import { gimbalLeakPoint } from "../src/gimbal-drum.js";
import { gimbalCentre } from "../src/gimbal-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE GIMBAL's `FIRE`, and what it is fired at** (`boss-cue-read-y.ts`).
 * The owner, 29 September 2026, every boss: a shot cue carries a clear aim
 * target (`cue-helper.ts`). The word stays at the hull under the seam's
 * column, where the cannon goes; the crosshair rides the bead running down
 * it, off the drawing's own `gimbalLeakPoint`.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function leaking(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  s.phase = "shear";
  s.phaseBeat = world.beat - 1;
  s.seamCol = 5;
  s.seamBeat = world.beat - Math.floor(CFG.gimbalSeamBeats / 2);
  return world;
}

describe("THE GIMBAL's FIRE", () => {
  it("stands at the hull under the seam and rings the bead on its way down", () => {
    const world = leaking();
    const s = gimbalBoss(world);
    if (s === null) throw new Error("no cradle");
    const fire = gimbalCues(L, world, s, 0.5).find((c) => c.word === "FIRE");
    expect(fire?.x).toBeCloseTo(fieldX(L, 5), 5);
    expect(fire?.y).toBe(L.hullY);
    const bead = gimbalLeakPoint(L, CFG, s, world.beat, 0.5);
    expect(fire?.aim?.x).toBeCloseTo(bead.x, 5);
    expect(fire?.aim?.y).toBeCloseTo(bead.y, 5);
    expect(fire?.aim?.y).toBeLessThan(L.hullY);
    expect(fire?.aim?.y).toBeGreaterThan(gimbalCentre(L, CFG).y);
  });

  it("follows the bead as the beat runs on", () => {
    const world = leaking();
    const s = gimbalBoss(world);
    if (s === null) throw new Error("no cradle");
    const at = (phase: number) => gimbalCues(L, world, s, phase)[0]?.aim?.y ?? Number.NaN;
    expect(at(0.9)).toBeGreaterThan(at(0.1));
  });
});
