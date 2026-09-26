import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SeamPhase,
  type SeamState,
  type SeamStep,
  seamBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { seamTurn, seamTurnWidth } from "../src/seam-story.js";
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
 * THE SEAM's two story steps, drawn (`render/src/seam-story.ts`): the ridge
 * turning its back and swinging round again, and the glow from within going
 * out a vein per shot. Set rather than played to, `seam-frame.test.ts`'s
 * arrangement; `sim/test/seam-story.test.ts` proves the rules.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const BLIND: SeamStep = { ask: "blind", color: "either", offset: 0, seals: false };
const GLOW: SeamStep = { ask: "glow", color: "either", offset: 0, seals: false };
const POINT: SeamStep = { ask: "point", color: "red", offset: 0, seals: true };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The ridge in `phase` a beat in, `lit` under the cursor — or just behind it, at rest. */
function posed(world: World, phase: SeamPhase, lit: SeamStep): SeamState {
  const s = seamBoss(world);
  if (s === null) throw new Error("the seam wave stood no ridge");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.shot = false;
  s.guarded = false;
  s.quenched = 0;
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

describe("THE SEAM's turn", () => {
  it("swings round through an edge, and back over the rest after", () => {
    const world = stood();
    const s = posed(world, "lit", BLIND);
    s.phaseBeat = world.beat;
    expect(seamTurn(s, CFG, world.beat, 0)).toBe(0);
    expect(seamTurnWidth(seamTurn(s, CFG, world.beat, 0.5))).toBeLessThan(0.2);
    expect(seamTurn(s, CFG, world.beat + 1, 0)).toBe(1);
    const after = posed(world, "rest", BLIND);
    after.phaseBeat = world.beat;
    expect(seamTurn(after, CFG, world.beat, 0)).toBe(1);
    expect(seamTurn(after, CFG, world.beat + CFG.seamRestBeats, 0)).toBe(0);
    expect(seamTurn(posed(world, "lit", POINT), CFG, world.beat, 0.5)).toBe(0);
  });

  it.each(ROLES)("shows its ribbed back and no crack, on %s", (role) => {
    const grit = frame(role, (w) => posed(w, "lit", { ...BLIND, ask: "grit" }));
    const turned = frame(role, (w) => posed(w, "lit", BLIND));
    expect(turned).not.toBe(grit);
    expect(tinted(turned, PALETTE.background)).toBeGreaterThan(0);
  });
});

describe("THE SEAM's glow", () => {
  it.each(ROLES)("burns white through the crack, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest", POINT));
    const glow = frame(role, (w) => posed(w, "lit", GLOW));
    expect(tinted(glow, PALETTE.hullRim)).toBeGreaterThan(tinted(resting, PALETTE.hullRim));
  });

  it.each(ROLES)("goes out a vein per shot landed, on %s", (role) => {
    const full = frame(role, (w) => posed(w, "lit", GLOW));
    const one = frame(role, (w) => {
      posed(w, "lit", GLOW).quenched = 1;
    });
    const two = frame(role, (w) => {
      posed(w, "lit", GLOW).quenched = 2;
    });
    expect(tinted(one, PALETTE.hullRim)).toBeLessThan(tinted(full, PALETTE.hullRim));
    expect(tinted(two, PALETTE.hullRim)).toBeLessThan(tinted(one, PALETTE.hullRim));
  });

  it("draws the same glow the same way twice", () => {
    const arrange = (w: World) => {
      posed(w, "lit", GLOW).quenched = 1;
    };
    expect(frame("p1", arrange)).toBe(frame("p1", arrange));
  });
});
