import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
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
import { seamFalseLight } from "../src/seam-hold.js";
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
 * THE SEAM's two steps answered by sending nothing, drawn
 * (`render/src/seam-hold.ts`): the false point flickering grey at the
 * crack's midpoint and fading after, and the crack lying dark, flashing white
 * as a bolt fired into it reseals it. Set rather than played to,
 * `seam-frame.test.ts`'s arrangement; `sim/test/seam-hold.test.ts` proves the
 * rules.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const DECOY: SeamStep = { ask: "decoy", color: "either", offset: 0, seals: false };
const DARK: SeamStep = { ask: "dark", color: "either", offset: 0, seals: false };
const POINT: SeamStep = { ask: "point", color: "red", offset: 0, seals: true };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The ridge in `phase` a beat in, `sealed` points shut, `lit` under the cursor — or just behind it, at rest. */
function posed(world: World, phase: SeamPhase, lit: SeamStep, sealed = 2): SeamState {
  const s = seamBoss(world);
  if (s === null) throw new Error("the seam wave stood no ridge");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.sealed = sealed;
  s.shot = false;
  s.guarded = false;
  s.held = false;
  s.cursor = phase === "rest" ? 1 : 0;
  s.steps[0] = lit;
  return s;
}

/** Three frames with the ridge set as `arrange` says; `reseal` fires the flash on the first tick. */
function frame(role: ViewRole, arrange: (world: World) => void, reseal = false): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (reseal && tick === 0) w.events.push({ type: "seamReseal", col: midCol(w.cfg) });
    },
  });
  return log.join("|");
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const count = (colour: string) => text.split(colour).length - 1;
  return count(hex) + count(`rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE SEAM's false point", () => {
  it("is lit through its step and fades over the rest after it", () => {
    const world = stood();
    expect(seamFalseLight(posed(world, "lit", DECOY), CFG, world.beat, 0)).toBe(1);
    const after = posed(world, "rest", DECOY);
    after.phaseBeat = world.beat;
    expect(seamFalseLight(after, CFG, world.beat, 0)).toBe(1);
    expect(seamFalseLight(after, CFG, world.beat + CFG.seamRestBeats, 0)).toBe(0);
    expect(seamFalseLight(posed(world, "lit", POINT), CFG, world.beat, 0)).toBe(0);
    expect(seamFalseLight(posed(world, "rest", POINT), CFG, world.beat, 0)).toBe(0);
  });

  it.each(ROLES)("flickers in the shell's grey and in no cannon's colour, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest", POINT));
    const decoy = frame(role, (w) => posed(w, "lit", DECOY));
    expect(tinted(decoy, PALETTE.rock)).toBeGreaterThan(tinted(resting, PALETTE.rock));
    for (const hex of [PALETTE.red, PALETTE.cyan, PALETTE.hullRim]) {
      expect(tinted(decoy, hex)).toBe(tinted(resting, hex));
    }
  });

  it("draws the same false point the same way twice", () => {
    const arrange = (w: World) => {
      posed(w, "lit", DECOY);
    };
    expect(frame("p1", arrange)).toBe(frame("p1", arrange));
  });
});

describe("THE SEAM's dark", () => {
  it.each(ROLES)("lies still, with the last point's sealed white on it, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest", POINT, 3));
    const dark = frame(role, (w) => posed(w, "lit", DARK, 3));
    expect(dark).not.toBe(resting);
    expect(tinted(dark, PALETTE.hullRim)).toBeGreaterThan(tinted(resting, PALETTE.hullRim));
  });

  it.each(ROLES)("flashes white down the crack as a bolt reseals it, on %s", (role) => {
    const arrange = (w: World) => {
      posed(w, "lit", DARK, 3).held = true;
    };
    const held = frame(role, arrange);
    const resealed = frame(role, arrange, true);
    expect(tinted(resealed, PALETTE.hullRim)).toBeGreaterThan(tinted(held, PALETTE.hullRim));
  });
});
