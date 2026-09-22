import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BEARING_TURN,
  createWorld,
  type GimbalState,
  gimbalBoss,
  gimbalShownMilli,
  INNER,
  NO_BEARING,
  NO_SEAM,
  OUTER,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { gimbalFaceMilli } from "../src/gimbal-shape.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GIMBAL's six poses — dark and still, one ring turning, both at true,
 * the shear, the loose spin and the drum split open — on all three screens.
 *
 * The states are **set** rather than played to, `filament-frame.test.ts`'s
 * arrangement: `sim/test/gimbal.test.ts` proves the alignments, the shears
 * and the seam, and what this file asks is whether every branch of the
 * picture is one a canvas accepts, plus the two things nothing else could
 * catch: that **neither seat is ever shown the other's ring** — the pilot's
 * screen identical whatever the inner ring is doing, the navigator's
 * whatever the outer is — and that the rim says how many teeth are left
 * without anything printing the number.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the cradle hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  return s;
}

/** The opening dark, the beat it began. */
function still(world: World): GimbalState {
  const s = body(world);
  s.phase = "still";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.atMilli = [0, 0];
  s.seamCol = NO_SEAM;
  return s;
}

/** Alignment `cursor` up, both rings standing where `outer` and `inner` say — in true bearings. */
function turning(world: World, outer: number, inner: number, cursor = 0): GimbalState {
  const s = still(world);
  s.phase = "turn";
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  s.atMilli = [outer, inner];
  s.handMilli = [NO_BEARING, NO_BEARING];
  return s;
}

/** Both rings on the marks of alignment `cursor`, which is what a shear is about to follow. */
function aligned(world: World, cursor = 0): GimbalState {
  const mark = body(world).marks[cursor];
  if (mark === undefined) throw new Error("the script has no such alignment");
  const s = turning(world, mark.outerMilli, mark.innerMilli, cursor);
  s.heldBeats = 1;
  return s;
}

/** A tooth coming off: `cursor` alignments spent, a beat into the shear. */
function shearing(world: World, cursor = 1): GimbalState {
  const s = still(world);
  s.phase = "shear";
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  return s;
}

/** The last tooth gone and the seam leaking, half way down its fuse. */
function leaking(world: World): GimbalState {
  const s = body(world);
  const spent = shearing(world, s.marks.length);
  spent.seamCol = 5;
  spent.seamBeat = world.beat - Math.floor(CFG.gimbalSeamBeats / 2);
  return spent;
}

/** The drum open, a beat in: the rings loose and the hatch swinging. */
function opening(world: World): GimbalState {
  const s = still(world);
  s.phase = "open";
  s.phaseBeat = world.beat - 1;
  s.cursor = s.marks.length;
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

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the cradle set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE GIMBAL's cradle", () => {
  it.each(ROLES)("hangs the drum dark and still, on %s", (role) => {
    const dark = frame(role, still);
    expect(dark.calls).toBeGreaterThan(50);
    // Rock, because neither ring is ever shot. The counts are relative
    // throughout this file: the whole frame is logged, and the ship's own
    // band carries both trigger colours whatever the boss is doing.
    expect(count(dark.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it.each(ROLES)("marks the ring once an alignment is up, on %s", (role) => {
    const up = frame(role, (w) => turning(w, 0, 0));
    const dark = frame(role, still);
    expect(up.text).not.toBe(dark.text);
    expect(count(up.text, PALETTE.hullRim)).toBeGreaterThan(count(dark.text, PALETTE.hullRim));
  });

  it("shows the pilot the outer ring alone and the navigator the inner alone", () => {
    const mark = body(hung()).marks[0];
    if (mark === undefined) throw new Error("the script has no first alignment");
    // His screen is the same whatever the inner ring is doing, and hers the
    // same whatever the outer is. Neither can read the other's bearing, which
    // is the whole of the encounter.
    expect(frame("p1", (w) => turning(w, 100, 0)).text).toBe(
      frame("p1", (w) => turning(w, 100, 700)).text,
    );
    expect(frame("p2", (w) => turning(w, 0, 100)).text).toBe(
      frame("p2", (w) => turning(w, 700, 100)).text,
    );
    // And each screen does change with its own ring.
    expect(frame("p1", (w) => turning(w, 100, 0)).text).not.toBe(
      frame("p1", (w) => turning(w, 700, 0)).text,
    );
    expect(frame("p2", (w) => turning(w, 0, 100)).text).not.toBe(
      frame("p2", (w) => turning(w, 0, 700)).text,
    );
    // The test screen holds both rings, so it changes with either.
    expect(frame("test", (w) => turning(w, 100, 0)).text).not.toBe(
      frame("test", (w) => turning(w, 100, 700)).text,
    );
  });

  it.each(ROLES)("glows a ring standing at true, on %s", (role) => {
    const on = frame(role, (w) => aligned(w, 0));
    const off = frame(role, (w) => turning(w, 500, 500));
    expect(on.text).not.toBe(off.text);
  });

  it.each(ROLES)("draws the rim a tooth shorter for every alignment spent, on %s", (role) => {
    // The health is the silhouette: a rim with one tooth left is a different
    // picture from one with three, and no count is written anywhere.
    const fresh = frame(role, (w) => turning(w, 200, 200, 0));
    const worn = frame(role, (w) => turning(w, 200, 200, 2));
    expect(worn.text).not.toBe(fresh.text);
    expect(count(worn.text, PALETTE.rockDark)).toBeGreaterThan(0);
  });

  it.each(ROLES)("sparks the tooth off on the shear, on %s", (role) => {
    const cut = frame(role, (w) => shearing(w, 1));
    expect(cut.calls).toBeGreaterThan(50);
    expect(count(cut.text, PALETTE.hullRim)).toBeGreaterThan(0);
  });

  it.each(ROLES)("runs the leak down the field toward the column it breaches, on %s", (role) => {
    const leak = frame(role, leaking);
    const dry = frame(role, (w) => shearing(w, 3));
    expect(leak.text).not.toBe(dry.text);
    // The seam is the one part of this boss that carries a trigger colour,
    // and it only does so while it is leaking.
    const hot = (t: string) => count(t, PALETTE.red) + count(t, PALETTE.cyan);
    expect(hot(leak.text)).toBeGreaterThan(hot(dry.text));
  });

  it.each(ROLES)("splits the drum open and spins the rings loose, on %s", (role) => {
    const open = frame(role, opening);
    const shut = frame(role, (w) => turning(w, 200, 200, 3));
    expect(open.text).not.toBe(shut.text);
    // The core behind the hatch is the one violet on this boss, and it is
    // only lit once the leaves have parted. Its rim, because the glow is the
    // one stroke laid in the palette's own hex — a fill goes down as `rgba`
    // and the stub logs what it was given.
    expect(count(open.text, PALETTE.wispRim)).toBeGreaterThan(count(shut.text, PALETTE.wispRim));
  });

  it("mirrors both the ring and its mark together, so true stays true under the fold", () => {
    // `gimbalFaceMilli` is the one place a true bearing becomes a drawn one,
    // and the ring and the mark both go through it. A fold that reached one
    // and not the other would put the mark where the ring can never be — so
    // the check is that the mirror is the same function for both, whichever
    // ring and whichever seat, rather than a drawn frame: no wave puts this
    // boss under a flip, and `computeLayout` only folds one the wave names
    // (`field-flip.ts`).
    const folded = { ...L, flip: true };
    for (const ring of [OUTER, INNER] as const) {
      for (const milli of [0, 125, 400, 750, 999]) {
        expect(gimbalFaceMilli(L, milli, ring)).toBe(gimbalShownMilli(milli, ring));
        expect(gimbalFaceMilli(folded, milli, ring)).toBe(
          (BEARING_TURN - gimbalShownMilli(milli, ring)) % BEARING_TURN,
        );
      }
    }
  });

  it("keeps nothing of one run in the next", () => {
    // Every pose is read off the world: two runs of the same state are the
    // same frame, and nothing outlives one (`gimbal-draw.ts` keeps no state).
    expect(frame("test", (w) => turning(w, 300, 600)).text).toBe(
      frame("test", (w) => turning(w, 300, 600)).text,
    );
  });
});
