import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OculusState,
  type OculusStep,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
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
 * THE OCULUS's three levels as the picture has them since 2 October 2026
 * (`oculus-levers.ts`, `oculus-fuse.ts`): a row of pips on each side of the
 * ring for a tap, a knob each on it for a turn, green as each count comes,
 * and the lit level's time left as THE SLOW's fuse over the lens — none over
 * a shot, which waits. `oculus-frame.test.ts` has the lens itself.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The lens stood, `lit` the step under the cursor, lit a beat ago. */
function lit(world: World, at: OculusStep): OculusState {
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.steps[0] = at;
  s.socketOpen = at.ask === "fire";
  s.leavesShut = at.ask === "fire" ? 2 : 0;
  return s;
}

function frame(role: ViewRole, at: OculusStep, arrange: (s: OculusState) => void = () => {}) {
  const world = createWorld(CFG, 5);
  arrange(lit(world, at));
  const log: string[] = [];
  const { ctx } = runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const rgba = `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`;
  return text.split(hex).length - 1 + text.split(rgba).length - 1;
}

const TAP: OculusStep = { ask: "tap", color: "either", beats: 32, need: 12 };
const TURN: OculusStep = { ask: "turn", color: "either", beats: 32, need: 8 };
const SHUT: OculusStep = { ask: "shut", color: "either", beats: 6, fuse: 32 };
const FIRE: OculusStep = { ask: "fire", color: "red", beats: 0 };

describe("THE OCULUS's levels", () => {
  it.each(ROLES)("lights a pip green for every tap a seat gives, on %s", (role) => {
    const none = frame(role, TAP);
    const some = frame(role, TAP, (s) => {
      s.taps = [3, 1];
    });
    expect(tinted(some.text, PALETTE.good)).toBeGreaterThan(tinted(none.text, PALETTE.good));
  });

  it.each(ROLES)("carries each knob round the ring by its own count, on %s", (role) => {
    const still = frame(role, TURN);
    const turned = frame(role, TURN, (s) => {
      s.held = [true, true];
      s.turned = [90000, 45000];
    });
    expect(turned.text).not.toBe(still.text);
    expect(tinted(turned.text, PALETTE.good)).toBeGreaterThan(tinted(still.text, PALETTE.good));
  });

  it.each(ROLES)(
    "stands the level's time left over the lens, and none over a shot, on %s",
    (role) => {
      const level = frame(role, SHUT);
      const shot = frame(role, FIRE);
      // Freshly lit, the fuse is whole, and a whole fuse is green.
      expect(tinted(level.text, PALETTE.good)).toBeGreaterThan(0);
      expect(tinted(shot.text, PALETTE.good)).toBe(0);
    },
  );
});
