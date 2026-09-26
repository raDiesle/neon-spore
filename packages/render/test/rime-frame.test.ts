import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  RIME_FULL_MILLI,
  type RimeAsk,
  type RimePhase,
  type RimeState,
  type RimeStep,
  rimeBoss,
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
 * THE RIME's poses — dropping in, frosted solid, a half lit for its wipe, a
 * patch opening as the frost goes, the core bared and lit in each colour,
 * smaller per hit, a surge crawling in through a shield step, and the pane
 * shattered — on all three screens.
 *
 * The states are **set** rather than played to, `vise-frame.test.ts`'s
 * arrangement: `sim/test/rime*.test.ts` proves the script, the wipes and the
 * surges. What this file asks is whether every branch of the picture is one a
 * canvas accepts, and that each says what it has to: the frost pale, the lit
 * half white, the core in the colour it asks for.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the lens stood, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): RimeState {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no lens");
  return s;
}

/** The lens in `phase`, a beat in, each half's frost `frost` and `lit` the step under the cursor. */
function posed(
  world: World,
  phase: RimePhase,
  frost: [number, number] = [RIME_FULL_MILLI, RIME_FULL_MILLI],
  lit?: RimeStep,
): RimeState {
  const s = body(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.rimeMilli = frost;
  s.hits = 0;
  s.bared = false;
  s.cursor = 0;
  if (lit !== undefined) s.steps[0] = lit;
  return s;
}

function asking(ask: RimeAsk, color: RimeStep["color"] = "either", beats = 4): RimeStep {
  return { ask, color, beats };
}

/** The core owed a shot: both halves clear, the core bared, a fire step lit. */
function firing(world: World, color: RimeStep["color"], hits = 0): RimeState {
  const s = posed(world, "lit", [0, 0], asking("fire", color));
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

describe("THE RIME's lens", () => {
  it.each(ROLES)("stands a frosted pane of grey glass, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    expect(resting.calls).toBeGreaterThan(30);
    expect(tinted(resting.text, PALETTE.rimeFrost)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.rimeFrostDeep)).toBeGreaterThan(0);
    expect(tinted(resting.text, PALETTE.rockDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("drops into frame, on %s", (role) => {
    const dropping = frame(role, (w) => {
      posed(w, "still").phaseBeat = w.beat;
    });
    expect(dropping.text).not.toBe(frame(role, (w) => posed(w, "rest")).text);
  });

  it.each(ROLES)("lights the half a wipe asks for in white, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, "rest"));
    const left = frame(role, (w) => posed(w, "lit", undefined, asking("left")));
    const right = frame(role, (w) => posed(w, "lit", undefined, asking("right")));
    expect(tinted(left.text, PALETTE.hullRim)).toBeGreaterThan(
      tinted(resting.text, PALETTE.hullRim),
    );
    expect(right.text).not.toBe(left.text);
  });

  it.each(ROLES)("opens a patch as wide as the frost is gone, on %s", (role) => {
    const solid = frame(role, (w) => posed(w, "rest"));
    const half = frame(role, (w) => posed(w, "rest", [500, RIME_FULL_MILLI]));
    const most = frame(role, (w) => posed(w, "rest", [100, RIME_FULL_MILLI]));
    const other = frame(role, (w) => posed(w, "rest", [RIME_FULL_MILLI, 500]));
    expect(half.text).not.toBe(solid.text);
    expect(most.text).not.toBe(half.text);
    expect(other.text).not.toBe(half.text);
  });

  it.each(ROLES)("lights the core in the colour it asks for, on %s", (role) => {
    const resting = frame(role, (w) => {
      posed(w, "rest", [0, 0]).bared = true;
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

  it.each(ROLES)("crawls frost in from the rim through a shield step, on %s", (role) => {
    const bare = frame(role, (w) => {
      posed(w, "rest", [0, 0]).bared = true;
    });
    const surging = frame(role, (w) => {
      const s = posed(w, "lit", [0, 0], asking("shield"));
      s.bared = true;
      s.phaseBeat = w.beat - 3;
    });
    expect(surging.text).not.toBe(bare.text);
    expect(tinted(surging.text, PALETTE.rimeFrost)).toBeGreaterThan(
      tinted(bare.text, PALETTE.rimeFrost),
    );
  });

  it.each(ROLES)("shatters once the core is spent, on %s", (role) => {
    const shattered = frame(role, (w) => {
      const s = posed(w, "shattered", [0, 0]);
      s.bared = true;
      s.hits = 3;
    });
    expect(shattered.calls).toBeGreaterThan(30);
    expect(shattered.text).not.toBe(frame(role, (w) => posed(w, "rest", [0, 0])).text);
  });

  it("draws the same lens the same way twice", () => {
    const a = frame("p1", (w) => firing(w, "cyan", 1));
    const b = frame("p1", (w) => firing(w, "cyan", 1));
    expect(a.text).toBe(b.text);
  });
});
