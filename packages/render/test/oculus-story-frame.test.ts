import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OculusPhase,
  type OculusState,
  type OculusStep,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { oculusGaze, oculusGlare } from "../src/oculus-story.js";
import { PALETTE } from "../src/palette.js";
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
 * THE OCULUS's two story steps, drawn (`render/src/oculus-story.ts`): the
 * core dilated white with its beam down to the hull, and the core rolled
 * aside with its sight down another column. Set rather than played to,
 * `oculus-frame.test.ts`'s arrangement; `sim/test/oculus-story.test.ts`
 * proves the rules.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const FIRE: OculusStep = { ask: "fire", color: "red", beats: 3 };
const GLARE: OculusStep = { ask: "glare", color: "either", beats: 3 };
const LOOK: OculusStep = { ask: "look", color: "red", beats: 4, offset: -2 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Every leaf shut, the socket open, `lit` under the cursor — or just behind it, at rest. */
function posed(world: World, phase: OculusPhase, lit: OculusStep): OculusState {
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.leavesShut = 6;
  s.hits = 0;
  s.socketOpen = true;
  s.held = [false, false];
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

describe("THE OCULUS's glare", () => {
  it("opens while lit and eases shut over the rest after", () => {
    const world = stood();
    const s = posed(world, "lit", GLARE);
    s.phaseBeat = world.beat;
    expect(oculusGlare(s, CFG, world.beat, 0)).toBe(0);
    expect(oculusGlare(s, CFG, world.beat + 1, 0)).toBe(1);
    const after = posed(world, "rest", GLARE);
    after.phaseBeat = world.beat;
    expect(oculusGlare(after, CFG, world.beat, 0)).toBe(1);
    expect(oculusGlare(after, CFG, world.beat + CFG.oculusRestBeats, 0)).toBe(0);
    expect(oculusGlare(posed(world, "lit", FIRE), CFG, world.beat, 0.5)).toBe(0);
  });

  it.each(ROLES)("throws white light down to the hull, on %s", (role) => {
    const fire = frame(role, (w) => posed(w, "lit", { ...FIRE, color: "either" }));
    const glare = frame(role, (w) => posed(w, "lit", GLARE));
    expect(tinted(glare, PALETTE.hullRim)).toBeGreaterThan(tinted(fire, PALETTE.hullRim));
  });
});

describe("THE OCULUS's look", () => {
  it("rolls toward the side it looks down, and back over the rest after", () => {
    const world = stood();
    const s = posed(world, "lit", LOOK);
    expect(oculusGaze(s, CFG, world.beat, 0)).toBe(-1);
    expect(oculusGaze(posed(world, "lit", { ...LOOK, offset: 2 }), CFG, world.beat, 0)).toBe(1);
    const after = posed(world, "rest", LOOK);
    after.phaseBeat = world.beat;
    expect(oculusGaze(after, CFG, world.beat + CFG.oculusRestBeats, 0)).toBe(0);
    expect(oculusGaze(posed(world, "lit", FIRE), CFG, world.beat, 0)).toBe(0);
  });

  it.each(ROLES)("lights the core in its colour and draws a sight off it, on %s", (role) => {
    const fire = frame(role, (w) => posed(w, "lit", FIRE));
    const look = frame(role, (w) => posed(w, "lit", LOOK));
    expect(look).not.toBe(fire);
    expect(tinted(look, PALETTE.redRim)).toBeGreaterThan(tinted(fire, PALETTE.redRim));
  });

  it("draws the same look the same way twice", () => {
    const arrange = (w: World) => {
      posed(w, "lit", LOOK);
    };
    expect(frame("p1", arrange)).toBe(frame("p1", arrange));
  });
});
