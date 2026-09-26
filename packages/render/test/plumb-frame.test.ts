import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  PLUMB_UNREAD,
  type PlumbAsk,
  type PlumbPhase,
  type PlumbState,
  type PlumbStep,
  plumbBoss,
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
 * THE PLUMB's poses — dropping in, hanging lopsided, a weight coming true
 * under a level glass, the bob turned to show its core, the core lit in each
 * colour, smaller per hit, and the bob swinging free — on all three screens.
 *
 * The states are **set** rather than played to, `rime-frame.test.ts`'s
 * arrangement: `sim/test/plumb*.test.ts` proves the script, the settles and
 * the drifts. What this file asks is whether every branch of the picture is
 * one a canvas accepts, and that each says what it has to: the body bronze,
 * the asked glass lit, the core in the colour it asks for.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the bob hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("plumb");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): PlumbState {
  const s = plumbBoss(world);
  if (s === null) throw new Error("the plumb wave hung no bob");
  return s;
}

/** The bob in `phase`, a beat in, its weights `weights` and `lit` the step under the cursor. */
function posed(
  world: World,
  phase: PlumbPhase,
  weights: [number, number] = [0, 0],
  lit?: PlumbStep,
): PlumbState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.weights = weights;
  s.hits = 0;
  s.coreLit = false;
  s.cursor = 0;
  s.heldBeats = 0;
  s.tiltMilli = [PLUMB_UNREAD, PLUMB_UNREAD];
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: PlumbAsk, color: PlumbStep["color"] = "either", beats = 4): PlumbStep {
  return { ask, color, beats, rangeMilli: 4000 };
}

/** The core owed a shot: both weights true, the core lit, a fire step lit. */
function firing(world: World, color: PlumbStep["color"], hits = 0): PlumbState {
  const s = posed(world, "lit", [2, 2], asking("fire", color));
  s.coreLit = true;
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

/** Three frames, inside a beat, with the bob set as `arrange` says. */
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

describe("THE PLUMB's bob", () => {
  it.each(ROLES)("hangs a bob of old bronze, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.plumbBronze)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.plumbBronzeDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("drops into frame, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(dropping.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("comes level a settle at a time, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "rest"));
    const one = frame(role, (w) => posed(w, "rest", [1, 0]));
    const three = frame(role, (w) => posed(w, "rest", [2, 1]));
    expect(one.text).not.toBe(none.text);
    expect(three.text).not.toBe(one.text);
  });

  it.each(ROLES)("lights the glass a level asks for, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const left = frame(role, (w) => posed(w, "lit", undefined, asking("left")));
    const right = frame(role, (w) => posed(w, "lit", undefined, asking("right")));
    expect(tinted(left.text, PALETTE.plumbGlass)).toBeGreaterThan(
      tinted(resting.text, PALETTE.plumbGlass),
    );
    expect(right.text).not.toBe(left.text);
  });

  it.each(ROLES)("moves the bubble with the phone and brightens it inside, on %s", (role) => {
    const leaning = (tilt: number, held = 0) =>
      frame(role, (w) => {
        const s = posed(w, "lit", undefined, asking("left"));
        s.tiltMilli = [tilt, PLUMB_UNREAD];
        s.heldBeats = held;
      });
    const unread = leaning(PLUMB_UNREAD);
    const off = leaning(15_000);
    const inside = leaning(1000);
    const held = leaning(1000, 2);
    expect(off.text).not.toBe(unread.text);
    expect(inside.text).not.toBe(off.text);
    expect(tinted(inside.text, PALETTE.plumbGlass)).toBeGreaterThan(
      tinted(off.text, PALETTE.plumbGlass),
    );
    expect(held.text).not.toBe(inside.text);
  });

  it.each(ROLES)("turns to show its core once both weights are true, on %s", (role) => {
    const dark = frame(role, (w) => posed(w, "rest", [2, 2]));
    const lit = frame(role, (w) => {
      posed(w, "rest", [2, 2]).coreLit = true;
    });
    expect(lit.text).not.toBe(dark.text);
    expect(tinted(lit.text, PALETTE.plumbGlass)).toBeGreaterThan(
      tinted(dark.text, PALETTE.plumbGlass),
    );
  });

  it.each(ROLES)("lights the core in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => {
      posed(w, "rest", [2, 2]).coreLit = true;
    });
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

  it.each(ROLES)("sways off true through a both step held late, on %s", (role) => {
    const early = frame(role, (w) => {
      posed(w, "lit", [2, 2], asking("both")).coreLit = true;
    });
    const late = frame(role, (w) => {
      const s = posed(w, "lit", [2, 2], asking("both"));
      s.coreLit = true;
      s.phaseBeat = w.beat - 3;
    });
    expect(late.text).not.toBe(early.text);
  });

  it.each(ROLES)("swings free once the core is spent, on %s", (role) => {
    const free = frame(role, (w) => {
      const s = posed(w, "free", [2, 2]);
      s.coreLit = true;
      s.hits = 3;
    });
    expect(free.calls).toBeGreaterThan(30);
    expect(free.text).not.toBe(frame(role, (w) => posed(w, "rest", [2, 2])).text);
  });

  it("draws the same bob the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
