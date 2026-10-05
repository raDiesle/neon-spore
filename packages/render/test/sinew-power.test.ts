import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, sinewBoss, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE SINEW's shifting fibre, on the handles** (`sinew-power.ts`): a hand's
 * power in force is a word beside its handle — `STRONG`, `WEAK` — and a whole
 * hand has none; the beat before a shift the hand about to change says the
 * coming word with its arrow, and a hand the call leaves alone says nothing
 * new. On every screen, since both handles are drawn on both.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The tendon hung past its drop-in, with each hand's power and call as given. */
function hung(power: [number, number], call: [number, number] = [0, 0]): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sinew");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < (CFG.sinewEnterBeats + 1) * TPB; i++) step(world, []);
  const s = sinewBoss(world);
  if (s === null) throw new Error("the sinew wave hung no tendon");
  s.powerP1Permille = power[0];
  s.powerP2Permille = power[1];
  s.callP1Permille = call[0];
  s.callP2Permille = call[1];
  s.shiftBeat = -1;
  return world;
}

/** The words drawn over three ticks. */
function words(world: World, role: ViewRole): string[] {
  const texts: TextBox[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.texts = texts;
    },
  });
  return texts.map((t) => t.text);
}

describe("THE SINEW's pull power on the handles", () => {
  it.each(ROLES)("says nothing of a whole hand, on %s", (role) => {
    const said = words(hung([1000, 1000]), role);
    expect(said.some((w) => w.includes("STRONG") || w.includes("WEAK"))).toBe(false);
  });

  it.each(ROLES)("says STRONG and WEAK beside the hands in force, on %s", (role) => {
    const said = words(hung([CFG.sinewShiftStrongPermille, CFG.sinewShiftWeakPermille]), role);
    expect(said).toContain("STRONG");
    expect(said).toContain("WEAK");
  });

  it.each(ROLES)("calls the coming power on the hand that changes, and only it, on %s", (role) => {
    const strong = CFG.sinewShiftStrongPermille;
    const said = words(hung([1000, 1000], [strong, 1000]), role);
    expect(said).toContain("▲ STRONG");
    expect(said.some((w) => w.includes("NORMAL"))).toBe(false);
    const back = words(hung([strong, 1000], [1000, 1000]), role);
    expect(back).toContain("NORMAL");
  });
});
