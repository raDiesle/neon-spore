import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  BELLOWS_SEAMS,
  type BellowsState,
  bellowsBoss,
  createWorld,
  NO_HAND,
  NO_SPARK,
  type SimEvent,
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
 * THE BELLOWS's poses — shut and still, his chamber drawn open, hers pressed
 * flat, both caught in a jam, both swollen on the last seam, and the waist
 * letting go — on all three screens.
 *
 * The states are **set** rather than played to, `gimbal-frame.test.ts`'s
 * arrangement: `sim/test/bellows.test.ts` proves the alternation, the jam and
 * the split, and what this file asks is whether every branch of the picture is
 * one a canvas accepts, plus the two things nothing else could catch: that
 * **each seat is shown its own handle and not the other's** while both are
 * shown the whole lung, and that the waist says how many seams are left
 * without anything printing the number.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the lung hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("bellows");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): BellowsState {
  const s = bellowsBoss(world);
  if (s === null) throw new Error("the bellows wave hung no lung");
  return s;
}

/** The opening dark: the waist tight, both hands off, nothing leaking. */
function still(world: World): BellowsState {
  const s = body(world);
  s.phase = "still";
  s.phaseBeat = world.beat;
  s.seams = BELLOWS_SEAMS;
  s.handMilli = [NO_HAND, NO_HAND];
  s.sparkCol = NO_SPARK;
  return s;
}

/** His beat, with his thumb `depth` of the way down the rail. */
function pulling(world: World, depth = 400, seams = BELLOWS_SEAMS): BellowsState {
  const s = still(world);
  s.phase = "pull";
  s.phaseBeat = world.beat - 1;
  s.seams = seams;
  s.handMilli = [depth, NO_HAND];
  return s;
}

/** Her beat, his chamber drawn out and hers shutting under her thumb. */
function pushing(world: World, depth = 400, seams = BELLOWS_SEAMS - 1): BellowsState {
  const s = still(world);
  s.phase = "push";
  s.phaseBeat = world.beat - 1;
  s.seams = seams;
  s.handMilli = [NO_HAND, depth];
  return s;
}

/** Both handles jammed, a beat in: the fight's one fault. */
function jammed(world: World): BellowsState {
  const s = still(world);
  s.phase = "jam";
  s.phaseBeat = world.beat - 1;
  s.seams = BELLOWS_SEAMS - 1;
  return s;
}

/** A seam parting, half way through its own beats. */
function parting(world: World, seams = BELLOWS_SEAMS - 2): BellowsState {
  const s = still(world);
  s.phase = "seam";
  s.phaseBeat = world.beat - Math.floor(CFG.bellowsSeamBeats / 2);
  s.seams = seams;
  return s;
}

/** A spark leaking out of the newest gap, half way down to the hull. */
function leaking(world: World): BellowsState {
  const s = parting(world, BELLOWS_SEAMS - 2);
  s.sparkCol = 5;
  s.sparkBeat = world.beat - Math.floor(CFG.bellowsSparkBeats / 2);
  return s;
}

/** The last seam, both chambers full and both handles free. */
function last(world: World, hands: [number, number] = [NO_HAND, NO_HAND]): BellowsState {
  const s = still(world);
  s.phase = "last";
  s.phaseBeat = world.beat - 1;
  s.seams = 1;
  s.handMilli = hands;
  return s;
}

/** The waist split and the halves falling apart, a beat into the vent. */
function venting(world: World): BellowsState {
  const s = still(world);
  s.phase = "vent";
  s.phaseBeat = world.beat - 1;
  s.seams = 0;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  /** One event thrown on the first tick, for the reactions: the fx are the one
   * part of this picture read off what *happened* rather than off what is
   * (`render/bellows-fx.ts`). */
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && said !== null) w.events.push(said);
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the lung set as `arrange` says. */
function frame(
  role: ViewRole,
  arrange: (world: World) => void,
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9, said);
}

describe("THE BELLOWS's lung", () => {
  it.each(ROLES)("hangs the chambers shut and still, on %s", (role) => {
    const dark = frame(role, still);
    expect(dark.calls).toBeGreaterThan(50);
    // Rock, because nothing on this boss is ever shot: the spark is, and it
    // is not leaking yet. The counts are relative throughout this file — the
    // whole frame is logged, and the ship's band carries both colours.
    expect(count(dark.text, PALETTE.rock)).toBeGreaterThan(0);
  });

  it.each(ROLES)("draws his chamber out as far as his thumb has carried it, on %s", (role) => {
    // The fourth standard, and it is on **both** screens: how far a chamber is
    // drawn out is exactly what *now* and *not yet* are said about, so a seat
    // that could not see the other's chamber could not take its turn.
    const shallow = frame(role, (w) => pulling(w, 200));
    const deep = frame(role, (w) => pulling(w, 900));
    expect(shallow.text).not.toBe(deep.text);
    expect(shallow.text).not.toBe(frame(role, still).text);
  });

  it("shows the pilot his own handle alone and the navigator hers alone", () => {
    // On the last seam both chambers are full whatever the hands are doing,
    // so the only thing a hand can change on a screen there is the handle
    // itself — which is the one thing this boss keeps from a seat.
    const loose = (w: World) => {
      last(w);
    };
    const his = (w: World) => {
      last(w, [500, NO_HAND]);
    };
    const hers = (w: World) => {
      last(w, [NO_HAND, 500]);
    };
    expect(frame("p1", his).text).not.toBe(frame("p1", loose).text);
    expect(frame("p2", hers).text).not.toBe(frame("p2", loose).text);
    // And neither seat is told the other's hand is on the rail at all.
    expect(frame("p1", hers).text).toBe(frame("p1", loose).text);
    expect(frame("p2", his).text).toBe(frame("p2", loose).text);
    // The test screen is one person holding both seats and carries both.
    expect(frame("test", his).text).not.toBe(frame("test", loose).text);
    expect(frame("test", hers).text).not.toBe(frame("test", loose).text);
  });

  it.each(ROLES)("pinches the waist thinner for every seam gone, on %s", (role) => {
    // The health is the silhouette: a waist with one seam left is a different
    // picture from one with four, and no count is written anywhere.
    const whole = frame(role, (w) => pulling(w, 400, BELLOWS_SEAMS));
    const worn = frame(role, (w) => pulling(w, 400, 1));
    expect(worn.text).not.toBe(whole.text);
    // A gap is lit rather than drawn dark, so a worn waist carries more of
    // the violet the parted seams glow in.
    expect(count(worn.text, PALETTE.wispRim)).toBeGreaterThan(count(whole.text, PALETTE.wispRim));
  });

  it.each(ROLES)("turns the exchange round: his chamber open, hers shutting, on %s", (role) => {
    const his = frame(role, (w) => pulling(w, 900));
    const hers = frame(role, (w) => pushing(w, 200));
    expect(his.text).not.toBe(hers.text);
  });

  it.each(ROLES)("catches both chambers halfway in a jam, on %s", (role) => {
    const stuck = frame(role, jammed);
    const working = frame(role, (w) => pulling(w, 400));
    expect(stuck.text).not.toBe(working.text);
    expect(stuck.calls).toBeGreaterThan(50);
  });

  it.each(ROLES)("runs the spark down the field toward the hull, on %s", (role) => {
    const hot = frame(role, leaking);
    const dry = frame(role, (w) => parting(w));
    expect(hot.text).not.toBe(dry.text);
    // Ember, and it is the one thing on this boss drawn in it: either bolt
    // shuts the spark, so it wears neither trigger colour (§11.35).
    expect(count(hot.text, PALETTE.emberRim)).toBeGreaterThan(count(dry.text, PALETTE.emberRim));
  });

  it.each(ROLES)("swells both chambers and glows both handles on the last seam, on %s", (role) => {
    const glowing = frame(role, (w) => last(w));
    const ordinary = frame(role, (w) => pulling(w, 400, 1));
    expect(glowing.text).not.toBe(ordinary.text);
  });

  it.each(ROLES)("falls apart and shows the mouth it has been squeezing, on %s", (role) => {
    const out = frame(role, venting);
    const shut = frame(role, (w) => last(w));
    expect(out.text).not.toBe(shut.text);
    // The hollow behind the cap is lit in the body's own violet, and it is
    // only there once the halves have turned (`bellowsMouthPath`) — the
    // waist's gaps glow in the brighter rim, so this count is the mouth's.
    expect(count(out.text, PALETTE.wisp)).toBeGreaterThan(count(shut.text, PALETTE.wisp));
  });

  it.each(ROLES)("moves the whole lung when a seam lets go, on %s", (role) => {
    // The reactions are applied to the context and never to a path, so what a
    // seam changes is where everything is drawn rather than what is drawn
    // (`bellows-fx.ts`). A frame with one thrown at it is a different frame.
    const quiet = frame(role, (w) => pulling(w, 400));
    const jolted = frame(role, (w) => pulling(w, 400), {
      type: "bellowsSeam",
      seams: 2,
      col: 5,
    });
    expect(jolted.text).not.toBe(quiet.text);
  });
});
