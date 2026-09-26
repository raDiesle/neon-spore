import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TrivetAsk,
  type TrivetPhase,
  type TrivetState,
  type TrivetStep,
  ticksPerBeat,
  trivetBoss,
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
 * THE TRIVET's poses — dropping in, both feet up, a foot lit for its chord
 * and swinging down as it is held, a pad pressed, a foot clamped home, the
 * hub lit in each colour and smaller per hit, the feet creeping loose through
 * a `both` step, and the stand collapsed — on all three screens.
 *
 * The states are **set** rather than played to, `rime-frame.test.ts`'s
 * arrangement: `sim/test/trivet*.test.ts` proves the script, the chords and
 * the plants. What this file asks is whether every branch of the picture is
 * one a canvas accepts, and that each says what it has to: the stand
 * gunmetal, the lit sockets blue-white, the hub in the colour it asks for.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the stand in, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): TrivetState {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  return s;
}

/** The stand in `phase`, a beat in, its feet planted `feet` times and `lit` the step under the cursor. */
function posed(
  world: World,
  phase: TrivetPhase,
  feet: [number, number] = [0, 0],
  lit?: TrivetStep,
): TrivetState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.feet = feet;
  s.hits = 0;
  s.hubLit = false;
  s.padsDown = [0, 0];
  s.heldBeats = 0;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: TrivetAsk, pads = 2, color: TrivetStep["color"] = "either"): TrivetStep {
  return { ask, pads, color, beats: 4 };
}

/** The hub owed a shot: both feet home, the hub lit, a fire step under the cursor. */
function firing(world: World, color: TrivetStep["color"], hits = 0): TrivetState {
  const s = posed(world, "lit", [2, 2], asking("fire", 2, color));
  s.hubLit = true;
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

/** Three frames, inside a beat, with the stand set as `arrange` says. */
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

describe("THE TRIVET's stand", () => {
  it.each(ROLES)("stands a gunmetal tripod, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.trivetMetal)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.trivetMetalDark)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.trivetSocket)).toBe(0);
  });

  it.each(ROLES)("drops into frame, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(dropping.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights the sockets a chord asks for, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const front = frame(role, (w) => posed(w, "lit", [0, 0], asking("front")));
    const rear = frame(role, (w) => posed(w, "lit", [0, 0], asking("rear")));
    const three = frame(role, (w) => posed(w, "lit", [0, 0], asking("front", 3)));
    expect(tinted(front.text, PALETTE.trivetSocket)).toBeGreaterThan(
      tinted(resting.text, PALETTE.trivetSocket),
    );
    expect(rear.text).not.toBe(front.text);
    expect(tinted(three.text, PALETTE.trivetSocket)).toBeGreaterThan(
      tinted(front.text, PALETTE.trivetSocket),
    );
  });

  it.each(ROLES)("draws a pad held down pressed, on %s", (role) => {
    const open = frame(role, (w) => posed(w, "lit", [0, 0], asking("front")));
    const pressed = frame(role, (w) => {
      posed(w, "lit", [0, 0], asking("front")).padsDown = [1, 0];
    });
    expect(pressed.text).not.toBe(open.text);
  });

  it.each(ROLES)("swings a foot down as its chord is held, on %s", (role) => {
    const up = frame(role, (w) => posed(w, "lit", [0, 0], asking("front")));
    const swinging = frame(role, (w) => {
      const s = posed(w, "lit", [0, 0], asking("front"));
      s.padsDown = [3, 0];
      s.heldBeats = 2;
    });
    expect(swinging.text).not.toBe(up.text);
  });

  it.each(ROLES)("clamps a foot home on its second plant, on %s", (role) => {
    const once = frame(role, (w) => posed(w, "rest", [1, 0]));
    const home = frame(role, (w) => posed(w, "rest", [2, 0]));
    const up = frame(role, (w) => posed(w, "rest"));
    expect(once.text).not.toBe(up.text);
    expect(home.text).not.toBe(once.text);
  });

  it.each(ROLES)("lights the hub in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => {
      posed(w, "rest", [2, 2]).hubLit = true;
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

  it.each(ROLES)("shrinks the hub's face for every hit, on %s", (role) => {
    const whole = frame(role, (w) => firing(w, "red", 0));
    const hit = frame(role, (w) => firing(w, "red", 1));
    const twice = frame(role, (w) => firing(w, "red", 2));
    expect(hit.text).not.toBe(whole.text);
    expect(twice.text).not.toBe(hit.text);
  });

  it.each(ROLES)("lets the feet creep loose through a both step, on %s", (role) => {
    const planted = frame(role, (w) => {
      posed(w, "rest", [2, 2]).hubLit = true;
    });
    const creeping = frame(role, (w) => {
      const s = posed(w, "lit", [2, 2], asking("both"));
      s.hubLit = true;
      s.phaseBeat = w.beat - 3;
    });
    expect(creeping.text).not.toBe(planted.text);
    expect(tinted(creeping.text, PALETTE.trivetSocket)).toBeGreaterThan(
      tinted(planted.text, PALETTE.trivetSocket),
    );
  });

  it.each(ROLES)("collapses once the hub is spent, on %s", (role) => {
    const collapsed = frame(role, (w) => {
      const s = posed(w, "collapse", [2, 2]);
      s.hubLit = true;
      s.hits = 3;
    });
    expect(collapsed.calls).toBeGreaterThan(30);
    expect(collapsed.text).not.toBe(frame(role, (w) => posed(w, "rest", [2, 2])).text);
  });

  it("draws the same stand the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
