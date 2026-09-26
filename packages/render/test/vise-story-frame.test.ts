import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type VisePhase,
  type ViseState,
  type ViseStep,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { viseBite, viseLunge, viseSpit } from "../src/vise-story.js";
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
 * THE VISE's two story steps, drawn (`render/src/vise-story.ts`): the case
 * clamped and lunging at the hull with a white bar where the shield goes,
 * and a seed spat out over another column with its sight down to the hull.
 * Set rather than played to, `vise-frame.test.ts`'s arrangement;
 * `sim/test/vise-story.test.ts` proves the rules.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const FIRE: ViseStep = { ask: "fire", color: "red", beats: 3 };
const BITE: ViseStep = { ask: "bite", color: "either", beats: 3 };
const SPIT: ViseStep = { ask: "spit", color: "red", beats: 4, offset: 2 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Every seam cracked, the kernel bare, `lit` under the cursor — or just behind it, at rest. */
function posed(world: World, phase: VisePhase, lit: ViseStep): ViseState {
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cracks = [2, 2];
  s.hits = 1;
  s.bared = true;
  s.gapMilli = [CFG.viseOpenMilli, CFG.viseOpenMilli];
  s.heldBeats = 0;
  s.cursor = phase === "rest" ? 1 : 0;
  s.steps[0] = lit;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE VISE's bite", () => {
  it("clamps in while lit and lets go over the rest after", () => {
    const world = stood();
    const s = posed(world, "lit", BITE);
    s.phaseBeat = world.beat;
    expect(viseBite(s, CFG, world.beat, 0)).toBe(0);
    expect(viseBite(s, CFG, world.beat + 1, 0)).toBe(1);
    const after = posed(world, "rest", BITE);
    after.phaseBeat = world.beat;
    expect(viseBite(after, CFG, world.beat, 0)).toBe(1);
    expect(viseBite(after, CFG, world.beat + CFG.viseRestBeats, 0)).toBe(0);
    expect(viseBite(posed(world, "lit", FIRE), CFG, world.beat, 0.5)).toBe(0);
  });

  it("lunges toward the hull by the bite, never past it", () => {
    expect(viseLunge(0, 100)).toBe(0);
    expect(viseLunge(1, 100)).toBeGreaterThan(0);
    expect(viseLunge(1, 100)).toBeLessThan(100);
  });

  it.each(ROLES)("lights the hull white where the shield goes, on %s", (role) => {
    const fire = frame(role, (w) => posed(w, "lit", { ...FIRE, color: "either" }));
    const bite = frame(role, (w) => posed(w, "lit", BITE));
    expect(bite).not.toBe(fire);
    expect(tinted(bite, PALETTE.hullRim)).toBeGreaterThan(0);
  });
});

describe("THE VISE's spit", () => {
  it("throws the seed out while lit and takes it back over the rest after", () => {
    const world = stood();
    const s = posed(world, "lit", SPIT);
    s.phaseBeat = world.beat;
    expect(viseSpit(s, CFG, world.beat + 1, 0)).toBe(1);
    const after = posed(world, "rest", SPIT);
    after.phaseBeat = world.beat;
    expect(viseSpit(after, CFG, world.beat + CFG.viseRestBeats, 0)).toBe(0);
    expect(viseSpit(posed(world, "lit", BITE), CFG, world.beat, 0.5)).toBe(0);
  });

  it.each(ROLES)("draws the seed in its colour with a sight off it, on %s", (role) => {
    const bite = frame(role, (w) => posed(w, "lit", BITE));
    const spit = frame(role, (w) => posed(w, "lit", SPIT));
    expect(tinted(spit, PALETTE.redRim)).toBeGreaterThan(tinted(bite, PALETTE.redRim));
  });

  it("draws the same spit the same way twice", () => {
    const arrange = (w: World) => {
      posed(w, "lit", SPIT);
    };
    expect(frame("p1", arrange)).toBe(frame("p1", arrange));
  });
});
