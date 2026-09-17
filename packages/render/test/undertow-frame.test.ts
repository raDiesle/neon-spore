import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
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
 * THE UNDERTOW's plating, on both screens.
 *
 * The breaches are **set** rather than pushed into, which is
 * `throat-frame.test.ts`' arrangement and for its reason: which column the
 * floor comes up in is the rng's, and `sim/test/undertow.test.ts` already
 * proves the clock. What this file asks is whether every branch of the
 * picture is one a canvas accepts, and the two things nothing else in the
 * suite could catch: that the bow is on the pilot's screen and on no other,
 * and that a standing lobe reaches both — the navigator's plate has to stand
 * on a breach she can see.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  return u;
}

/** Every colour a screen set over a run of frames, as one string. */
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

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

function bowing(world: World, col: number, tall = false): void {
  floor(world).breaches.push({
    col,
    stage: "bowing",
    stageBeat: world.beat,
    tall,
    widthMilli: 0,
    widened: false,
  });
}

function standing(world: World, col: number, tall = false, widthMilli = 0): void {
  floor(world).breaches.push({
    col,
    stage: "standing",
    stageBeat: world.beat,
    tall,
    widthMilli,
    widened: false,
  });
}

describe("the undertow", () => {
  for (const role of ROLES) {
    it(`draws a plate bowing for ${role}`, () => {
      const world = opened();
      bowing(world, 2);
      expect(drawn(world, role, TPB).calls).toBeGreaterThan(500);
    });

    it(`draws a lobe standing in a parted plate for ${role}`, () => {
      const world = opened();
      standing(world, 4);
      const quiet = drawn(opened(), role, TPB).text;
      const { calls, text } = drawn(world, role, TPB);
      expect(calls).toBeGreaterThan(500);
      // The lobe is rock: a grey the empty field never sets.
      expect(count(text, PALETTE.rockDark)).toBeGreaterThan(count(quiet, PALETTE.rockDark));
    });

    it(`puts both beam colours on a tall lobe and neither on a plain one for ${role}`, () => {
      const plain = opened();
      standing(plain, 4);
      const tall = opened();
      standing(tall, 4, true);
      const a = drawn(plain, role, TPB).text;
      const b = drawn(tall, role, TPB).text;
      expect(count(b, PALETTE.cyan)).toBeGreaterThan(count(a, PALETTE.cyan));
      expect(count(b, PALETTE.red)).toBeGreaterThan(count(a, PALETTE.red));
    });

    it(`draws a breach widened past its column for ${role}`, () => {
      const world = opened();
      standing(world, 4, false, CFG.undertowWideMilli);
      expect(drawn(world, role, TPB).calls).toBeGreaterThan(500);
    });
  }

  it("puts the bow on the pilot's screen and on no other", () => {
    // The load-bearing test of this file. The column the next lobe is pushing
    // at is the pilot's whole first part of this fight, and a copy of it on
    // the navigator's phone would leave the pair nothing to say.
    const p2 = opened();
    bowing(p2, 2);
    expect(drawn(p2, "p2", TPB).text).toBe(drawn(opened(), "p2", TPB).text);
    const p1 = opened();
    bowing(p1, 2);
    expect(drawn(p1, "p1", TPB).text).not.toBe(drawn(opened(), "p1", TPB).text);
    const both = opened();
    bowing(both, 2);
    expect(drawn(both, "test", TPB).text).not.toBe(drawn(opened(), "test", TPB).text);
  });

  it("shows a standing lobe to both seats", () => {
    // Nothing about a breach that is open is kept from either screen: the
    // navigator's plate has to stand on it, and the pilot's maw has to open
    // over it.
    for (const role of ["p1", "p2"] as const) {
      const world = opened();
      standing(world, 4);
      expect(drawn(world, role, TPB).text).not.toBe(drawn(opened(), role, TPB).text);
    }
  });

  it("lights the whole edge before the last lobe, on both screens", () => {
    // The rise is every seam at once and there is no column to call, so the
    // navigator is shown it too — the one bow that is not the pilot's alone.
    for (const role of ROLES) {
      const world = opened();
      const u = floor(world);
      u.phase = "last";
      u.phaseBeat = world.beat;
      bowing(world, midCol(CFG));
      expect(drawn(world, role, TPB * 2).text).not.toBe(drawn(opened(), role, TPB * 2).text);
    }
  });

  it("draws the body passing through and stops when the boss does", () => {
    const world = opened();
    const u = floor(world);
    u.phase = "taken";
    u.phaseBeat = world.beat;
    u.taken = 1;
    const quiet = drawn(opened(), "test", TPB).text;
    // Through the whole pass and a beat past it: the sim nulls the boss at the
    // end, so the last frames are of a field with no floor under them.
    const { calls, text } = drawn(world, "test", (CFG.undertowDownBeats + 2) * TPB);
    expect(calls).toBeGreaterThan(500);
    // The body's ground, which nothing else in this wave draws.
    expect(count(text, PALETTE.sheenDeep)).toBeGreaterThan(count(quiet, PALETTE.sheenDeep));
    expect(undertowBoss(world)).toBeNull();
  });

  it("lights the seat's column while the cannon is unseated, on the pilot's screen", () => {
    const seated = opened();
    const world = opened();
    floor(world).unseatedUntil = world.beat + CFG.undertowUnseatedBeats;
    expect(drawn(world, "p1", TPB).text).not.toBe(drawn(seated, "p1", TPB).text);
    const p2 = opened();
    floor(p2).unseatedUntil = p2.beat + CFG.undertowUnseatedBeats;
    expect(drawn(p2, "p2", TPB).text).toBe(drawn(opened(), "p2", TPB).text);
  });

  it("never draws the floor before its wave installs one", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(undertowBoss(world)).toBeNull();
    expect(drawn(world, "p1", TPB).text).not.toContain(PALETTE.rockDark);
  });
});
