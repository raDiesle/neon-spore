import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OculusAsk,
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
 * THE OCULUS's poses — settling, open, a pair lit and sliding shut under two
 * thumbs, the socket breaking, the core lit in each colour and in white, a
 * cracked pair owed its reseal, the leaves shut a pair at a time, and the
 * lens shattered — on all three screens.
 *
 * The states are **set** rather than played to, `seam-frame.test.ts`'s
 * arrangement: `sim/test/oculus*.test.ts` proves the script, the holds and
 * the misses. What this file asks is whether every branch of the picture is
 * one a canvas accepts, and that each says what it has to: the lens grey, the
 * lit pair white, the core in the colour it asks for and smaller per hit.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the lens stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): OculusState {
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  return s;
}

/** The lens in `phase`, a beat in, `shut` leaves closed and `lit` the step under the cursor. */
function posed(world: World, phase: OculusPhase, shut = 0, lit?: OculusStep): OculusState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.leavesShut = shut;
  s.hits = 0;
  s.socketOpen = false;
  s.held = [false, false];
  s.heldBeats = 0;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: OculusAsk, color: OculusStep["color"] = "either", beats = 4): OculusStep {
  return { ask, color, beats };
}

/** The core owed a shot: every leaf shut, the socket open, a fire step lit. */
function firing(world: World, color: OculusStep["color"], hits = 0): OculusState {
  const s = posed(world, "lit", 6, asking("fire", color));
  s.socketOpen = true;
  s.hits = hits;
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

/** Three frames, inside a beat, with the lens set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = stood();
  arrange(world);
  return drawn(world, role, 9);
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

describe("THE OCULUS's lens", () => {
  it.each(ROLES)("stands a grey rim round a dark face, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.rock)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.rockDark)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.dim)).toBeGreaterThan(0);
  });

  it.each(ROLES)("settles into frame, on %s", (role) => {
    const settling = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(settling.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights the pair a hold asks for in white, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const lit = frame(role, (w) => posed(w, "lit", 0, asking("shut")));
    expect(tinted(lit.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("slides the pair shut as both thumbs hold it, on %s", (role) => {
    const waiting = frame(role, (w) => posed(w, "lit", 2, asking("shut")));
    const holding = frame(role, (w) => {
      const s = posed(w, "lit", 2, asking("shut"));
      s.held = [true, true];
      s.heldBeats = 2;
    });
    expect(holding.text).not.toBe(waiting.text);
  });

  it.each(ROLES)("opens the socket over a break, on %s", (role) => {
    const shut = frame(role, (w) => posed(w, "rest", 6));
    const breaking = frame(role, (w) => posed(w, "lit", 6, asking("break")));
    expect(breaking.text).not.toBe(shut.text);
  });

  it.each(ROLES)("lights the core in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest", 6));
    const red = frame(role, (w) => firing(w, "red"));
    const cyan = frame(role, (w) => firing(w, "cyan"));
    const either = frame(role, (w) => firing(w, "either"));
    expect(tinted(red.text, PALETTE.red)).toBeGreaterThan(tinted(resting.text, PALETTE.red));
    expect(tinted(cyan.text, PALETTE.cyan)).toBeGreaterThan(tinted(resting.text, PALETTE.cyan));
    expect(tinted(either.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("shrinks the core for every hit, on %s", (role) => {
    const whole = frame(role, (w) => firing(w, "red", 0));
    const hit = frame(role, (w) => firing(w, "red", 1));
    const twice = frame(role, (w) => firing(w, "red", 2));
    expect(hit.text).not.toBe(whole.text);
    expect(twice.text).not.toBe(hit.text);
  });

  it.each(ROLES)("stands a cracked pair open until it is resealed, on %s", (role) => {
    const whole = frame(role, (w) => posed(w, "rest", 6));
    const cracked = frame(role, (w) => posed(w, "lit", 6, asking("reseal")));
    expect(cracked.text).not.toBe(whole.text);
    expect(tinted(cracked.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(whole.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("changes for every pair shut, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "rest", 0));
    const one = frame(role, (w) => posed(w, "rest", 2));
    const two = frame(role, (w) => posed(w, "rest", 4));
    const three = frame(role, (w) => posed(w, "rest", 6));
    expect(one.text).not.toBe(none.text);
    expect(two.text).not.toBe(one.text);
    expect(three.text).not.toBe(two.text);
  });

  it.each(ROLES)("shatters once the core is spent, on %s", (role) => {
    const shattered = frame(role, (w) => posed(w, "shatter", 6));
    expect(shattered.calls).toBeGreaterThan(30);
    expect(shattered.text).not.toBe(frame(role, (w) => posed(w, "rest", 6)).text);
  });

  it("draws the same lens the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
