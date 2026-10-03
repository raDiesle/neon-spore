import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, FRONT, GIMBAL_SCRIPT, see, view } from "@neon-spore/content";
import {
  createWorld,
  type GimbalState,
  gimbalBoss,
  NO_BEARING,
  NO_SEAM,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bakedEntries, clearBakedCaches } from "../src/baked.js";
import { gimbalGrabR } from "../src/gimbal-grip.js";
import { onRim } from "../src/gimbal-rig.js";
import { gimbalHush, gimbalTilt, KEEP, LEVEL, tilted } from "../src/gimbal-tilt.js";
import { computeLayout } from "../src/layout.js";
import { NO_SPAN } from "../src/slow-hush.js";
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
 * **THE GIMBAL's drift** (`gimbal-tilt.ts`): on in the game since 3 October 2026,
 * the flat furniture lands on the rig it is laid over, the drift steadies
 * for the hands, and at its widest it never moves the rim a thumb is measured
 * against out of reach — nor a ring out of the true band it is aligned in.
 * And it costs no more than the flat picture: within a tenth of its canvas
 * calls, and nothing more baked the longer it runs.
 */

beforeAll(() => {
  installCanvasGlobals();
});

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
/** The outer ring's radius in tiles: the furthest any rim point is from the middle. */
const OUTER_R = 3.4;

/** The drift sampled across ten minutes at `hush`: every tilt it can take. */
function every(hush: number) {
  const out = [];
  for (let t = 0; t < 600; t += 0.1) out.push(gimbalTilt(t, hush));
  return out;
}

function hung(phase: GimbalState["phase"], beatsIn: number, cursor = 0): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  s.phase = phase;
  s.phaseBeat = world.beat - beatsIn;
  s.cursor = cursor;
  s.atMilli = [120, 640];
  s.handMilli = [NO_BEARING, NO_BEARING];
  s.seamCol = NO_SEAM;
  return world;
}

/**
 * The most canvas calls one frame of each phase costs on any screen. It was
 * held within a tenth of the flat picture's while that picture was still
 * drawn to compare against; since that went, it is held to this row. Set
 * `MEASURE` to print the calls; never committed as `true`.
 */
const MEASURE = false;
const CALLS = { still: 367, turn: 397, shear: 375, open: 381 } as const;

/** The canvas calls one frame of `world` costs on `role`'s screen. */
function cost(world: World, role: (typeof ROLES)[number]): number {
  return runFrames(world, role, 1, { every: 1, onTick: (_tick, w) => step(w, []) }).ctx.calls;
}

/** Sprites held after `ticks` of the wave played from its start, the candidate on or off. */
function heldAfter(ticks: number): number {
  clearBakedCaches();
  const world = createWorld(CFG, 7);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  runFrames(world, "p1", ticks);
  return bakedEntries();
}

function drawn(world: World, role: (typeof ROLES)[number]): string {
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (_tick, w) => step(w, []),
  });
  return log.join("|");
}

describe("THE GIMBAL's drift", () => {
  it("drifts, and is level at a hush of nothing", () => {
    expect(gimbalTilt(13.7, 1)).not.toBe(LEVEL);
    expect(gimbalTilt(13.7, 0)).toBe(LEVEL);
  });

  it("lays a flat point on the ring exactly where the rig draws the ring", () => {
    for (const time of [0.5, 4, 19, 77]) {
      const t = gimbalTilt(time, 1);
      const w = view(FRONT + t.yaw, t.pitch);
      for (const milli of [0, 140, 250, 600, 910]) {
        const rig = see(onRim(OUTER_R, milli), w);
        const c = Math.cos(t.roll);
        const s = Math.sin(t.roll);
        const flat = see(onRim(OUTER_R, milli), view(FRONT));
        const laid = tilted(flat.x, flat.y, t);
        expect(laid.x).toBeCloseTo(rig.x * c - rig.y * s, 9);
        expect(laid.y).toBeCloseTo(rig.x * s + rig.y * c, 9);
      }
    }
  });

  it("wanders dark and still, steadies to a third through a turn, and stops once open", () => {
    const at = (phase: GimbalState["phase"], beatsIn: number, cursor = 0) => {
      const w = hung(phase, beatsIn, cursor);
      const s = gimbalBoss(w) as GimbalState;
      return gimbalHush(s, NO_SPAN, w.beat, 0);
    };
    expect(at("still", 1)).toBe(KEEP.still);
    expect(at("turn", 2)).toBeCloseTo(KEEP.turn, 9);
    expect(at("open", 2)).toBe(0);
    // Eased from what came before, never cut: the first turn starts from the
    // stillness, a later one from the shear.
    expect(at("turn", 0)).toBeCloseTo(KEEP.still, 9);
    expect(at("turn", 0, 1)).toBeCloseTo(KEEP.shear, 9);
    const half = at("turn", 0.5);
    expect(half).toBeLessThan(KEEP.still);
    expect(half).toBeGreaterThan(KEEP.turn);
  });

  it("never moves a rim a thumb is on out of the grab, nor a ring out of true, at its widest", () => {
    // The widest a ring is ever drifted while a hand can be on it is the
    // first beat of the first turn, eased down from the whole drift — so the
    // whole drift is what is measured.
    const grab = gimbalGrabR(L) / L.tile;
    // The band of the first alignment, the widest: since the marks were
    // swapped (3 October 2026) no seat judges its own ring against a mark by
    // eye — the partner says *stop* — so the tighter bands later in the wave
    // bound nothing a thumb can see here, and the drift is measured against
    // the band a pair first meets the rim in.
    const band = ((GIMBAL_SCRIPT[0]?.trueMilli ?? 0) / 1000) * Math.PI * 2;
    let radial = 0;
    let turned = 0;
    for (const t of every(1))
      for (let milli = 0; milli < 1000; milli += 50) {
        const flat = see(onRim(OUTER_R, milli), view(FRONT));
        const laid = tilted(flat.x, flat.y, t);
        radial = Math.max(radial, Math.abs(Math.hypot(laid.x, laid.y) - OUTER_R));
        const off = Math.atan2(laid.y, laid.x) - Math.atan2(flat.y, flat.x);
        turned = Math.max(turned, Math.abs(Math.atan2(Math.sin(off), Math.cos(off))));
      }
    expect(radial).toBeLessThan(grab / 2);
    // The ring and its mark are laid on together, so this is only how far a
    // thumb's own bearing is from the drawn rim — held under half the band.
    expect(turned).toBeLessThan(band / 2);
  });

  it("still shows neither seat the other's ring", () => {
    const p1 = (inner: number) => {
      const w = hung("turn", 1);
      (gimbalBoss(w) as GimbalState).atMilli = [120, inner];
      return drawn(w, "p1");
    };
    const p2 = (outer: number) => {
      const w = hung("turn", 1);
      (gimbalBoss(w) as GimbalState).atMilli = [outer, 640];
      return drawn(w, "p2");
    };
    // The first frame on each screen bakes what every later one reads.
    p1(0);
    p2(0);
    expect(p1(0)).toBe(p1(700));
    expect(p2(0)).toBe(p2(700));
  });

  it("costs no more canvas calls than its row, in any phase on any screen", () => {
    for (const phase of ["still", "turn", "shear", "open"] as const)
      for (const role of ROLES) {
        const calls = cost(hung(phase, 1, phase === "open" ? 3 : 1), role);
        if (MEASURE) console.log(phase, role, calls);
        else expect(calls).toBeLessThanOrEqual(CALLS[phase]);
      }
  });

  it("bakes nothing more the longer it runs", () => {
    expect(heldAfter(3200)).toBe(heldAfter(1600));
  });
});
