import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type ViseAsk,
  type VisePhase,
  type ViseState,
  type ViseStep,
  viseBoss,
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
 * THE VISE's poses — dropping in, resting whole, a lobe lit and pinched, each
 * seam cracked, the kernel bared and lit in each colour, smaller per hit, the
 * lobes creeping shut over it through a `both` step, closed back over it, and
 * the case split — on all three screens.
 *
 * The states are **set** rather than played to, `oculus-frame.test.ts`'s
 * arrangement: `sim/test/vise*.test.ts` proves the script, the pinches and
 * the misses. What this file asks is whether every branch of the picture is
 * one a canvas accepts, and that each says what it has to: the husk brown,
 * the lit seam white, the kernel in the colour it asks for.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the case stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): ViseState {
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  return s;
}

/** The case in `phase`, a beat in, `cracks` on each lobe and `lit` the step under the cursor. */
function posed(
  world: World,
  phase: VisePhase,
  cracks: [number, number] = [0, 0],
  lit?: ViseStep,
): ViseState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cracks = cracks;
  s.hits = 0;
  s.bared = false;
  s.gapMilli = [CFG.viseOpenMilli, CFG.viseOpenMilli];
  s.heldBeats = 0;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: ViseAsk, color: ViseStep["color"] = "either", beats = 4): ViseStep {
  return { ask, color, beats };
}

/** The kernel owed a shot: both lobes split, the kernel bared, a fire step lit. */
function firing(world: World, color: ViseStep["color"], hits = 0): ViseState {
  const s = posed(world, "lit", [2, 2], asking("fire", color));
  s.bared = true;
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

/** Three frames, inside a beat, with the case set as `arrange` says. */
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

describe("THE VISE's seed-case", () => {
  it.each(ROLES)("stands a brown husk with a pale spine, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.viseCase)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.viseCaseDark)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.viseCrack)).toBeGreaterThan(0);
  });

  it.each(ROLES)("drops into frame, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(dropping.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights the seam a pinch asks for in white, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const lit = frame(role, (w) => posed(w, "lit", [0, 0], asking("left")));
    expect(tinted(lit.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
  });

  it.each(ROLES)("narrows the lobe and cracks the seam as the pinch holds, on %s", (role) => {
    const open = frame(role, (w) => posed(w, "lit", [0, 0], asking("right")));
    const pinched = frame(role, (w) => {
      posed(w, "lit", [0, 0], asking("right")).gapMilli[1] = CFG.viseShutMilli;
    });
    const holding = frame(role, (w) => {
      const s = posed(w, "lit", [0, 0], asking("right"));
      s.gapMilli[1] = CFG.viseShutMilli;
      s.heldBeats = 2;
    });
    expect(pinched.text).not.toBe(open.text);
    expect(holding.text).not.toBe(pinched.text);
  });

  it.each(ROLES)("changes for every seam cracked, on %s", (role) => {
    const none = frame(role, (w) => posed(w, "rest", [0, 0]));
    const one = frame(role, (w) => posed(w, "rest", [1, 0]));
    const two = frame(role, (w) => posed(w, "rest", [2, 0]));
    const both = frame(role, (w) => posed(w, "rest", [2, 1]));
    expect(one.text).not.toBe(none.text);
    expect(two.text).not.toBe(one.text);
    expect(both.text).not.toBe(two.text);
  });

  it.each(ROLES)("lights the kernel in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => {
      posed(w, "rest", [2, 2]).bared = true;
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

  it.each(ROLES)("shrinks the kernel for every hit, on %s", (role) => {
    const whole = frame(role, (w) => firing(w, "red", 0));
    const hit = frame(role, (w) => firing(w, "red", 1));
    const twice = frame(role, (w) => firing(w, "red", 2));
    expect(hit.text).not.toBe(whole.text);
    expect(twice.text).not.toBe(hit.text);
  });

  it.each(ROLES)("creeps shut over the kernel unless both lobes hold, on %s", (role) => {
    const bared = (w: World, held: number): void => {
      const s = posed(w, "lit", [2, 2], asking("both"));
      s.bared = true;
      s.phaseBeat = w.beat - 3;
      s.heldBeats = held;
    };
    const creeping = frame(role, (w) => bared(w, 0));
    const holding = frame(role, (w) => bared(w, 3));
    expect(holding.text).not.toBe(creeping.text);
  });

  it.each(ROLES)("gapes over a kernel it has closed back over, on %s", (role) => {
    const covered = frame(role, (w) => posed(w, "rest", [2, 2]));
    const bared = frame(role, (w) => {
      posed(w, "rest", [2, 2]).bared = true;
    });
    expect(covered.text).not.toBe(bared.text);
  });

  it.each(ROLES)("splits once the kernel is spent, on %s", (role) => {
    const split = frame(role, (w) => {
      posed(w, "split", [2, 2]).bared = true;
    });
    expect(split.calls).toBeGreaterThan(30);
    expect(split.text).not.toBe(frame(role, (w) => posed(w, "rest", [2, 2])).text);
  });

  it("draws the same case the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
