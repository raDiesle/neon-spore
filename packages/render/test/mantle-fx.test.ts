import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  mantleBoss,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { MantleFx } from "../src/mantle-fx.js";
import { mantleCentre, mantleReach } from "../src/mantle-shape.js";
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
 * What THE MANTLE leaves behind a frame (`mantle-fx.ts`): the kick of a
 * shear, the core's flare as the finish lands, the hull's shudder, and where
 * its receipts are thrown. `mantle-frame.test.ts` has the poses read off the
 * world; this file has what the events add to them, on every screen — the
 * one pair boss with nothing split between seats.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const shear = (left: number): SimEvent => ({ type: "mantleShear", left, col: MID });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: MantleFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

describe("THE MANTLE's transients", () => {
  it("kicks the shell and shocks the hull on a shear, and forgets it", () => {
    const fx = new MantleFx();
    said(fx, [shear(3)]);
    expect(fx.kick).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(1);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.kick).toBe(0);
    expect(fx.hurt.value).toBe(0);
    said(fx, [shear(2)]);
    fx.clear();
    expect(fx).toEqual(new MantleFx());
  });

  it("throws a shear's bursts at the pair that went, one each side of the seam", () => {
    const at = mantleCentre(L, CFG);
    const tail = said(new MantleFx(), [shear(3)]);
    const nose = said(new MantleFx(), [shear(0)]);
    expect(tail).toHaveLength(2);
    const [left, right] = tail;
    expect(left?.x).toBeLessThan(at.x);
    expect(right?.x).toBeGreaterThan(at.x);
    expect(Math.abs((left?.x ?? 0) + (right?.x ?? 0) - 2 * at.x)).toBeLessThan(1e-6);
    // The tail's pair goes first, so the first shear bursts lower than the last.
    expect(tail[0]?.y ?? 0).toBeGreaterThan(nose[0]?.y ?? 0);
  });

  it("deals nothing for the handles lighting or a single finishing tap", () => {
    const fx = new MantleFx();
    said(fx, [
      { type: "mantleLight", col: MID },
      { type: "mantleBeat", left: 3, col: MID },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.kick).toBe(0);
    expect(fx.flare).toBeGreaterThan(0);
    expect(fx.flare).toBeLessThan(1);
    said(fx, [{ type: "mantleDark", col: MID }]);
    expect(fx.flare).toBe(1);
    expect(fx.hurt.value).toBe(1);
  });

  it("puts the spark out where it had run to, not where it started", () => {
    const at = mantleCentre(L, CFG);
    const gapY = at.y + mantleReach(L).ry;
    const early = new MantleFx();
    said(early, [{ type: "mantleLeak", col: MID }]);
    const late = new MantleFx();
    said(late, [{ type: "mantleLeak", col: MID }]);
    for (let i = 0; i < 60 * CFG.mantleSparkBeats * BEAT * 0.75; i++) late.update(1 / 60);
    const out: SimEvent = { type: "mantleSparkOut", col: MID };
    const [first] = said(early, [out]);
    const [second] = said(late, [out]);
    expect(first?.y ?? 0).toBeCloseTo(gapY, 5);
    expect(second?.y ?? 0).toBeGreaterThan(gapY + L.tile);
    expect(second?.y ?? 0).toBeLessThan(L.hullY);
  });
});

const TPB = ticksPerBeat(CFG);

/** The shell hung, a pull under way with a pair already shed. */
function pulling(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("mantle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = mantleBoss(world);
  if (s === null) throw new Error("the mantle wave hung no shell");
  s.phase = "pull";
  s.phaseBeat = world.beat - 2;
  s.cursor = 1;
  s.depthMilli = [0, 0];
  return world;
}

/** Three frames inside a beat, with `event` thrown on the first tick. */
function frame(role: ViewRole, event: SimEvent | null): string {
  const log: string[] = [];
  runFrames(pulling(), role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && event !== null) w.events.push(event);
    },
  });
  return log.join("|");
}

describe("THE MANTLE's transients on the field", () => {
  it.each(ROLES)("reacts to a shear and to the handles lighting, on %s", (role) => {
    // Every seat is thrown both: nothing of this boss is split between them.
    const quiet = frame(role, null);
    expect(frame(role, shear(2))).not.toBe(quiet);
    expect(frame(role, { type: "mantleLight", col: MID })).not.toBe(quiet);
  });
});
