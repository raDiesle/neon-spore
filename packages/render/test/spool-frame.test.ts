import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_BRAKE,
  type SimEvent,
  SPOOL_RIBS,
  type SpoolState,
  spoolBoss,
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
 * THE SPOOL's poses — taut and still, the brake shallow and the line running
 * fast, the brake deep and the line crawling, a rib easing open, the line
 * slipped, and the spool slack and drifting free — on all three screens.
 *
 * The states are **set** rather than played to:
 * `sim/test/spool.test.ts` proves the rate, the zone and the
 * ribs, and what this file asks is whether every branch of the picture is one
 * a canvas accepts, plus the two things nothing else could catch: that **the
 * pilot is shown his grip and not the zone, and the navigator the zone and
 * not the grip**, and that the rate is shown only as the line's speed.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);

/** A world with the spool hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("spool");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function body(world: World): SpoolState {
  const s = spoolBoss(world);
  if (s === null) throw new Error("the spool wave hung no spool");
  return s;
}

/** Taut and still, long enough in that the swing-in is done: four ribs, no hand, nothing run. */
function taut(world: World): SpoolState {
  const s = body(world);
  s.phase = "taut";
  s.phaseBeat = world.beat - 4;
  s.ribs = SPOOL_RIBS;
  s.brakeMilli = NO_BRAKE;
  s.paidMilli = 0;
  s.wantMilli = 0;
  s.leg = 0;
  s.legBeat = world.beat;
  s.wantRateMilli = 70;
  return s;
}

/**
 * A movement paying out, past its grace, with the brake `depth` deep and the
 * line `ahead` of its mark. The mark moves and the line does not, so how much
 * line has run — which the winding and the dashes both turn by — is the same
 * whatever `ahead` is.
 */
function paying(world: World, depth = 500, ahead = 0, ribs = SPOOL_RIBS): SpoolState {
  const s = taut(world);
  s.phase = "pay";
  s.phaseBeat = world.beat - 5;
  s.ribs = ribs;
  s.brakeMilli = depth;
  s.wantMilli = 400 - ahead;
  s.paidMilli = 400;
  return s;
}

/** The line slipped its zone, a beat in. */
function slipped(world: World): SpoolState {
  const s = paying(world, 500, 300);
  s.phase = "slip";
  s.phaseBeat = world.beat - 1;
  return s;
}

/** A rib half eased off the casing. */
function easing(world: World, ribs = SPOOL_RIBS - 1): SpoolState {
  const s = paying(world, 500, 0, ribs);
  s.phase = "ease";
  s.phaseBeat = world.beat - 1;
  s.brakeMilli = NO_BRAKE;
  return s;
}

/** The last rib gone and the spool turning away, a beat into the slack. */
function slack(world: World): SpoolState {
  const s = easing(world, 0);
  s.phase = "slack";
  s.phaseBeat = world.beat - 1;
  return s;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      // The state is held where it was set: a spool left to step would pay
      // out and slip, and the frames would be a race rather than a pose.
      if (tick === 0 && said !== null) w.events.push(said);
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the spool set as `arrange` says. */
function frame(
  role: ViewRole,
  arrange: (world: World) => void,
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9, said);
}

describe("THE SPOOL", () => {
  it.each(ROLES)("hangs the spool taut and still, on %s", (role) => {
    const still = frame(role, taut);
    expect(still.calls).toBeGreaterThan(50);
    // Rock for the casing and the ship's violet for the line.
    expect(count(still.text, PALETTE.rock)).toBeGreaterThan(0);
    expect(count(still.text, PALETTE.hull)).toBeGreaterThan(0);
  });

  it.each(ROLES)("runs the line fast on a shallow brake and slow on a deep one, on %s", (role) => {
    // Both seats see the line's speed — it is what *faster* and *slower* are
    // said about — so the two depths differ even where the brake is not drawn.
    const shallow = frame(role, (w) => paying(w, 100));
    const deep = frame(role, (w) => paying(w, 900));
    expect(shallow.text).not.toBe(deep.text);
    expect(shallow.text).not.toBe(frame(role, taut).text);
  });

  it("shows the pilot his brake and never the zone, the navigator the zone and never the brake", () => {
    // Where the line is against the zone moves only the navigator's bead.
    const on = (w: World) => {
      paying(w, 500, 0);
    };
    const off = (w: World) => {
      paying(w, 500, 150);
    };
    expect(frame("p1", off).text).toBe(frame("p1", on).text);
    expect(frame("p2", off).text).not.toBe(frame("p2", on).text);
    expect(frame("test", off).text).not.toBe(frame("test", on).text);

    const loose = (w: World) => {
      easing(w);
    };
    const gripped = (w: World) => {
      easing(w).brakeMilli = 600;
    };
    // In an ease nothing is paying, so a hand on the brake changes the brake
    // and nothing else: the pilot sees it, the navigator does not.
    expect(frame("p1", gripped).text).not.toBe(frame("p1", loose).text);
    expect(frame("p2", gripped).text).toBe(frame("p2", loose).text);
    expect(frame("test", gripped).text).not.toBe(frame("test", loose).text);
  });

  it.each(ROLES)("thins the winding and grooves the casing for every rib gone, on %s", (role) => {
    const whole = frame(role, (w) => paying(w, 500, 0, SPOOL_RIBS));
    const worn = frame(role, (w) => paying(w, 500, 0, 1));
    expect(worn.text).not.toBe(whole.text);
  });

  it.each(ROLES)("lifts a rib off the casing as it eases, on %s", (role) => {
    const going = frame(role, easing);
    const gone = frame(role, (w) => paying(w, 500, 0, SPOOL_RIBS - 1));
    expect(going.text).not.toBe(gone.text);
    // The rib going glows in the wisp's rim.
    expect(count(going.text, PALETTE.wispRim)).toBeGreaterThan(count(gone.text, PALETTE.wispRim));
  });

  it.each(ROLES)("throws a loop into the line when it slips, on %s", (role) => {
    expect(frame(role, slipped).text).not.toBe(frame(role, (w) => paying(w, 500, 300)).text);
  });

  it.each(ROLES)("turns its flange to the ship and drifts off when slack, on %s", (role) => {
    const loose = frame(role, slack);
    expect(loose.text).not.toBe(frame(role, (w) => easing(w, 1)).text);
    expect(loose.calls).toBeGreaterThan(20);
  });

  it.each(ROLES)("jolts the whole spool when a rib lets go, on %s", (role) => {
    const quiet = frame(role, (w) => paying(w, 500));
    const jolted = frame(role, (w) => paying(w, 500), { type: "spoolRib", ribs: 3, col: 5 });
    expect(jolted.text).not.toBe(quiet.text);
  });
});
