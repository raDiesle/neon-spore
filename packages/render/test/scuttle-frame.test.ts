import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type ScuttleState,
  scuttleBoss,
  scuttleSocketCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Effects } from "../src/effects.js";
import { rgba } from "../src/hex.js";
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
 * THE SCUTTLE's slab, its sockets, its hanging parts and its end, on all
 * three screens.
 *
 * The states are **set** rather than played to, `lead-frame.test.ts`'s
 * arrangement: `sim/test/scuttle.test.ts` proves the cadence, the strike,
 * the wind-up and the beam, and what this file asks is whether every branch
 * of the picture is one a canvas accepts — whole, a part loose, a part
 * struck off, twins, winding up, down, out — and the two things nothing
 * else in the suite could catch: that the **count** is on the pilot's
 * screen and not the navigator's, that the **live part** is on the
 * navigator's and not the pilot's; and that the jolt is a transient the
 * next run does not inherit.
 */

/**
 * The canvas, and one throwaway frame a seat: the first frame drawn at a
 * size lays down a sprite the frames after it `drawImage`, and two pictures
 * this file says are the same have to be two frames after that one.
 */
beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(hung(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

/**
 * A world with the frame in, stepped enough beats that every `*Beat` field
 * an arrangement sets in the past is still a beat the world has seen — a
 * `downBeat` before beat zero would read as a frame that stands. That is
 * past the count, so the first part has come loose; `frame_` puts it back.
 */
function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("scuttle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.scuttleOutBeats + 2); i++) step(world, []);
  return world;
}

/** The frame, whole and still counting: every part in its socket, nothing loose. */
function frame_(world: World): ScuttleState {
  const s = scuttleBoss(world);
  if (s === null) throw new Error("the scuttle wave hung no frame");
  s.loose = [];
  s.live = -1;
  s.cycleBeat = world.beat;
  return s;
}

/** Socket `i` has come loose this beat, live, its part red. */
function loose(world: World, i = 9): ScuttleState {
  const s = frame_(world);
  const part = s.parts[i];
  if (part) part.color = "red";
  s.loose = [i];
  s.live = i;
  s.cycleBeat = world.beat;
  return s;
}

/** Winding up on its last part, in socket 9. */
function winding(world: World): ScuttleState {
  const s = frame_(world);
  for (let i = 0; i < s.parts.length; i++) if (i !== 9) s.parts[i] = null;
  s.loose = [9];
  s.live = 9;
  s.cycleBeat = world.beat - 1;
  s.windBeat = world.beat - 1;
  return s;
}

/** The beam took the last part a beat ago. */
function down(world: World): ScuttleState {
  const s = winding(world);
  s.parts[9] = null;
  s.loose = [];
  s.live = -1;
  s.downBeat = world.beat - 1;
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

/** Three frames, still inside the count, with the frame whole and then set as `arrange` says. */
function frame(role: ViewRole, arrange: (world: World) => void): { calls: number; text: string } {
  const world = hung();
  frame_(world);
  arrange(world);
  return drawn(world, role, 9);
}

describe("THE SCUTTLE's frame", () => {
  it.each(ROLES)("draws the slab on %s", (role) => {
    const f = frame(role, () => {});
    expect(f.calls).toBeGreaterThan(200);
    expect(f.text).toContain(PALETTE.rock);
  });

  it("puts the count on the pilot's screen and not the navigator's", () => {
    // A socket emptied is a violet slot on the screen shown the count, and
    // a frame with two parts gone is the same picture as one whole on the
    // screen that is not.
    const whole = (role: ViewRole) => frame(role, () => {});
    const thinned = (role: ViewRole) =>
      frame(role, (w) => {
        const s = frame_(w);
        s.parts[2] = null;
        s.parts[11] = null;
      });
    expect(count(thinned("p1").text, PALETTE.hullRim)).toBeGreaterThan(
      count(whole("p1").text, PALETTE.hullRim),
    );
    expect(count(thinned("test").text, PALETTE.hullRim)).toBeGreaterThan(
      count(whole("test").text, PALETTE.hullRim),
    );
    expect(thinned("p2").text).toBe(whole("p2").text);
    expect(count(whole("p1").text, PALETTE.rock)).toBeGreaterThan(
      count(whole("p2").text, PALETTE.rock),
    );
  });

  it("puts the live part on the navigator's screen and not the pilot's", () => {
    // Two parts hang; the one that is live is red on the screen shown the
    // live part, with the lock in the shield's rim under it, and the other
    // way round is another picture there — and the same one where it is not.
    const twins = (role: ViewRole, live: number) =>
      frame(role, (w) => {
        const s = loose(w, 8);
        const other = s.parts[9];
        if (other) other.color = "red";
        s.loose = [8, 9];
        s.live = live;
      }).text;
    expect(count(twins("p2", 8), PALETTE.red)).toBeGreaterThan(0);
    expect(count(twins("test", 8), PALETTE.red)).toBeGreaterThan(0);
    expect(count(twins("p1", 8), PALETTE.red)).toBe(0);
    expect(count(twins("p2", 8), PALETTE.shieldRim)).toBeGreaterThan(
      count(twins("p1", 8), PALETTE.shieldRim),
    );
    expect(twins("p2", 8)).not.toBe(twins("p2", 9));
    expect(twins("test", 8)).not.toBe(twins("test", 9));
    expect(twins("p1", 8)).toBe(twins("p1", 9));
  });

  it.each(ROLES)("hangs a loose part under its socket on a thread, on %s", (role) => {
    // At the end of the cadence, not a beat into it: the thread is drawn only
    // once the part has fallen past its socket's own half height, and since
    // VERSUS `apart` shortened the drop to 0.26 tiles that is most of the way
    // through the fall rather than the start of it (`scuttle-shape.ts`).
    const bare = frame(role, () => {});
    const hanging = frame(role, (w) => {
      loose(w).cycleBeat = w.beat - 3;
    });
    expect(count(hanging.text, PALETTE.dim)).toBeGreaterThan(count(bare.text, PALETTE.dim));
    expect(hanging.text).not.toBe(bare.text);
  });

  it.each(ROLES)("draws the frame back on the wind-up, on %s", (role) => {
    const still = frame(role, (w) => {
      winding(w).windBeat = -1;
    });
    expect(frame(role, winding).text).not.toBe(still.text);
  });

  it.each(ROLES)("closes the sockets and fades the slab once the beam has it, on %s", (role) => {
    const going = frame(role, down);
    const stood = frame(role, winding);
    expect(count(going.text, PALETTE.rock)).toBeLessThan(count(stood.text, PALETTE.rock));
    const slab = rgba(PALETTE.rockDark, 0.85).slice(0, -5);
    expect(count(going.text, slab)).toBeGreaterThan(0);
    const gone = frame(role, (w) => {
      down(w).downBeat = w.beat - CFG.scuttleOutBeats - 1;
    });
    expect(count(gone.text, slab)).toBe(0);
  });

  it("rings the hanging parts on the pilot's screen and not the navigator's", () => {
    // The ring is offered while a part may still be carried and gone once
    // one has been, so a part swung to the column it was already over is the
    // same picture with the ring taken away — on the screen that has one.
    const ringed = (role: ViewRole) => frame(role, (w) => loose(w)).text;
    const spent = (role: ViewRole) =>
      frame(role, (w) => {
        const s = loose(w);
        s.swung = 9;
        s.swungCol = scuttleSocketCol(CFG, 9);
      }).text;
    expect(ringed("p1")).not.toBe(spent("p1"));
    expect(ringed("p2")).toBe(spent("p2"));
  });

  it("hangs a carried part over the column it was put in, on every screen", () => {
    // One column along is one tile along, and the thread leans after it, so
    // no seat is drawn a part in a place the throw will not come from.
    const put = (role: ViewRole, col: number) =>
      frame(role, (w) => {
        const s = loose(w);
        s.swung = 9;
        s.swungCol = col;
      }).text;
    for (const role of ROLES) {
      expect(put(role, scuttleSocketCol(CFG, 9) + 1)).not.toBe(put(role, scuttleSocketCol(CFG, 9)));
    }
  });

  it("keeps the jolt as a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "scuttleThrow", col: 5, socket: 5, left: 20 }], L, 0, () => 0, CFG);
    fx.update(1 / 60, L);
    expect(fx.boss.scuttle.jolt).toBeGreaterThan(0);
    expect(fx).not.toEqual(new Effects());
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});
