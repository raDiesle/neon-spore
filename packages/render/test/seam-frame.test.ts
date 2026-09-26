import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SeamAsk,
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
 * THE SEAM's poses — settling, the crack dark, a point lit in each colour and
 * in white, the grit, the rock, both at once, a point sealing, and the ridge
 * split — on all three screens.
 *
 * The states are **set** rather than played to, `valve-frame.test.ts`'s
 * arrangement: `sim/test/seam*.test.ts` proves the script, the answers and
 * the misses. What this file asks is whether every branch of the picture is
 * one a canvas accepts, and that each says what it has to: the ridge grey,
 * the lit point in the colour it asks for, the rock in the colour that
 * breaks it, and the ridge changing as its points seal.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the ridge stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("seam");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): SeamState {
  const s = seamBoss(world);
  if (s === null) throw new Error("the seam wave stood no ridge");
  return s;
}

/** The ridge in `phase`, a beat in, `sealed` points closed and `lit` the step under the cursor. */
function posed(world: World, phase: SeamPhase, sealed = 0, lit?: SeamStep): SeamState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.sealed = sealed;
  s.shot = false;
  s.guarded = false;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: SeamAsk, color: SeamStep["color"], offset = 0): SeamStep {
  return { ask, color, offset, seals: ask === "point" };
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

/** Three frames, inside a beat, with the ridge set as `arrange` says. */
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

describe("THE SEAM's ridge", () => {
  it.each(ROLES)("stands a grey ridge with its crack dark, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.rock)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.rockDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("settles into frame, on %s", (role) => {
    const settling = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(settling.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights a point in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const red = frame(role, (w) => posed(w, "lit", 0, asking("point", "red")));
    const cyan = frame(role, (w) => posed(w, "lit", 0, asking("point", "cyan")));
    const either = frame(role, (w) => posed(w, "lit", 0, asking("point", "either")));
    expect(tinted(red.text, PALETTE.red)).toBeGreaterThan(tinted(resting.text, PALETTE.red));
    expect(tinted(cyan.text, PALETTE.cyan)).toBeGreaterThan(tinted(resting.text, PALETTE.cyan));
    expect(tinted(either.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("puts the lit point out once it is shot, on %s", (role) => {
    const lit = frame(role, (w) => posed(w, "lit", 0, asking("point", "red")));
    const shot = frame(role, (w) => {
      posed(w, "lit", 0, asking("point", "red")).shot = true;
    });
    expect(tinted(shot.text, PALETTE.red)).toBeLessThan(tinted(lit.text, PALETTE.red));
  });

  it.each(ROLES)("throws grit and gapes while the shield is owed, on %s", (role) => {
    const grit = frame(role, (w) => posed(w, "lit", 0, asking("grit", "either")));
    const guarded = frame(role, (w) => {
      posed(w, "lit", 0, asking("grit", "either")).guarded = true;
    });
    expect(grit.text).not.toBe(guarded.text);
    expect(tinted(grit.text, PALETTE.rock)).toBeGreaterThan(tinted(guarded.text, PALETTE.rock));
  });

  it.each(ROLES)("spits a rock in the colour that breaks it, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const rock = frame(role, (w) => posed(w, "lit", 0, asking("rock", "cyan", 2)));
    expect(tinted(rock.text, PALETTE.cyan)).toBeGreaterThan(tinted(resting.text, PALETTE.cyan));
  });

  it.each(ROLES)("spits it at its own column, on %s", (role) => {
    const right = frame(role, (w) => posed(w, "lit", 0, asking("rock", "red", 2)));
    const left = frame(role, (w) => posed(w, "lit", 0, asking("rock", "red", -2)));
    expect(right.text).not.toBe(left.text);
  });

  it.each(ROLES)("throws grit and a rock at once, on %s", (role) => {
    const both = frame(role, (w) => posed(w, "lit", 0, asking("both", "either", -2)));
    const rockOnly = frame(role, (w) => {
      posed(w, "lit", 0, asking("both", "either", -2)).guarded = true;
    });
    expect(both.text).not.toBe(rockOnly.text);
    expect(tinted(rockOnly.text, PALETTE.hullRim)).toBeGreaterThan(0);
  });

  it.each(ROLES)("changes for every point sealed, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "rest", 0));
    const one = frame(role, (w) => posed(w, "rest", 1));
    const two = frame(role, (w) => posed(w, "rest", 2));
    expect(one.text).not.toBe(none.text);
    expect(two.text).not.toBe(one.text);
  });

  it.each(ROLES)("closes a point over the rest after its seal, on %s", (role) => {
    const closing = frame(role, (w) => {
      const s = posed(w, "rest", 1);
      s.phaseBeat = w.beat;
      s.cursor = 1;
      s.steps[0] = asking("point", "red");
    });
    const closed = frame(role, (w) => {
      posed(w, "rest", 1).phaseBeat = w.beat;
    });
    expect(closing.text).not.toBe(closed.text);
  });

  it.each(ROLES)("splits down its crack once sealed, on %s", (role) => {
    const split = frame(role, (w) => posed(w, "split", 3));
    expect(split.calls).toBeGreaterThan(30);
    expect(split.text).not.toBe(frame(role, (w) => posed(w, "rest", 3)).text);
  });

  it("draws the same ridge the same way twice", () => {
    const a = frame("p1", (w) => posed(w, "lit", 1, asking("both", "red", 2)));
    const b = frame("p1", (w) => posed(w, "lit", 1, asking("both", "red", 2)));
    expect(a.text).toBe(b.text);
  });
});
