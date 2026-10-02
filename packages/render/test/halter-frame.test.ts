import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HalterState,
  type HalterStep,
  halterBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { halterOpen, halterShake, halterTremor } from "../src/halter-pose.js";
import { rgba } from "../src/hex.js";
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

/** The shot's colour as the lit core is drawn in it: `drawLitCore`'s light and
 * ring are `rgba` of it, whatever the beat, and a gradient's stops are not in
 * the stub's log, so it is counted by its prefix (`lit-core.ts`). */
const CYAN_LIT = rgba(PALETTE.cyan, 0).slice(0, -2);

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE HALTER, drawn (`render/src/halter-draw.ts`): the plated slab with a
 * segment's seam lit and its grips, a grip held drawn pressed, a segment
 * parting as the pair holds and cracked open, the centre bared and its core
 * lit in a shot's colour, the tremor stopping dead while the pair holds, and
 * the slab split spent — on all three screens, set rather than played to;
 * `sim/test/halter.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const TPB = ticksPerBeat(CFG);
const LEFT: HalterStep = { ask: "left", color: "either", beats: 10 };
const GUARD: HalterStep = { ask: "guard", color: "either", beats: 8 };
const FIRE: HalterStep = { ask: "fire", color: "cyan", beats: 3 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The seam standing, `lit` under the cursor `beats` beats in, whole, nobody resting and no grip down. */
function posed(world: World, lit: HalterStep | null, beats = 1): HalterState {
  const s = halterBoss(world);
  if (s === null) throw new Error("the halter wave stood no seam");
  s.phase = lit === null ? "pause" : "lit";
  s.phaseBeat = world.beat - beats;
  s.cursor = 0;
  s.cracks = [0, 0];
  s.hits = 0;
  s.bared = false;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  s.grips = [0, 0];
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

/** The left step's pair holding: the navigator settled, the pilot's both grips down. */
function holding(world: World, beats = 0): HalterState {
  const s = posed(world, LEFT);
  s.restBeats = [0, world.cfg.halterRestThreshold];
  s.grips = [3, 0];
  s.heldBeats = beats;
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

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

describe("THE HALTER's seam", () => {
  it.each(ROLES)(
    "lights the asked segment's seam and its grips, and a held grip pressed, on %s",
    (role) => {
      const resting = frame(role, (w) => posed(w, null));
      const asked = frame(role, (w) => posed(w, LEFT));
      expect(count(asked, PALETTE.hullRim)).toBeGreaterThan(count(resting, PALETTE.hullRim));
      const pressed = frame(role, (w) => {
        posed(w, LEFT).grips = [1, 0];
      });
      expect(pressed).not.toBe(asked);
    },
  );

  it.each(ROLES)("parts a cracked segment to show what the plating hugs, on %s", (role) => {
    const whole = frame(role, (w) => posed(w, null));
    expect(count(whole, PALETTE.halterFlesh)).toBe(0);
    const cracked = frame(role, (w) => {
      posed(w, null).cracks = [1, 0];
    });
    expect(count(cracked, PALETTE.halterFlesh)).toBeGreaterThan(0);
  });

  it("parts the lit segment a hair as the pair holds, and shuts it the instant the count is gone", () => {
    const world = stood();
    const s = holding(world, 1);
    const held = halterOpen(world, s, 0, world.beat, 0.5);
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThan(1);
    expect(halterOpen(world, s, 2, world.beat, 0.5)).toBe(0);
    s.grips = [1, 0];
    s.heldBeats = 0;
    expect(halterOpen(world, s, 0, world.beat, 0.5)).toBe(0);
  });
});

describe("THE HALTER's tremor", () => {
  it("chatters while nobody is holding, and stops dead the instant the pair does", () => {
    const world = stood();
    const s = posed(world, LEFT);
    expect(halterShake(world, s)).toBe(1);
    holding(world);
    expect(halterShake(world, s)).toBe(0);
    s.grips = [1, 0];
    expect(halterShake(world, s)).toBe(1);
    s.phase = "alarmed";
    expect(halterShake(world, s)).toBe(2);
  });

  it("keeps no two plates in time, and is nothing at no shake", () => {
    const a = halterTremor(1.7, 0, 0, 3);
    const b = halterTremor(1.7, 1, 0, 3);
    const c = halterTremor(1.7, 0, 1, 3);
    expect(a).not.toEqual(b);
    expect(a).not.toEqual(c);
    expect(halterTremor(1.7, 0, 0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe("THE HALTER's centre and its split", () => {
  it.each(ROLES)("lights the bared core in the shot's colour, on %s", (role) => {
    const covered = frame(role, (w) => posed(w, FIRE));
    const bared = frame(role, (w) => {
      const s = posed(w, FIRE);
      s.cracks = [1, 1];
      s.bared = true;
    });
    expect(count(bared, CYAN_LIT)).toBeGreaterThan(count(covered, CYAN_LIT));
    const hit = frame(role, (w) => {
      const s = posed(w, FIRE);
      s.cracks = [1, 1];
      s.bared = true;
      s.hits = 2;
    });
    expect(hit).not.toBe(bared);
  });

  it("lets the bared centre creep shut through a guard, and the pair presses it back open", () => {
    const world = stood();
    const s = posed(world, GUARD, 6);
    s.cracks = [1, 1];
    s.bared = true;
    const loose = halterOpen(world, s, 1, world.beat, 0);
    expect(loose).toBeLessThan(1);
    s.restBeats = [world.cfg.halterRestThreshold, 0];
    s.grips = [0, 3];
    s.heldBeats = 1;
    expect(halterOpen(world, s, 1, world.beat, 0)).toBeGreaterThan(loose);
  });

  it.each(ROLES)("splits the slab spent and tips it edge-on, on %s", (role) => {
    const open = frame(role, (w) => {
      const s = posed(w, null);
      s.cracks = [1, 1];
      s.bared = true;
    });
    const spent = frame(role, (w) => {
      const s = posed(w, null, 1);
      s.cracks = [1, 1];
      s.bared = true;
      s.phase = "spent";
    });
    expect(spent).not.toBe(open);
  });

  it("draws the same seam the same way twice", () => {
    expect(frame("p1", (w) => posed(w, LEFT))).toBe(frame("p1", (w) => posed(w, LEFT)));
  });
});
