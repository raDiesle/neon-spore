import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  GRINDSTONE_PASSES_PER_FLAT,
  grindstoneBoss,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { JAB_SHAKE } from "../src/boss-hurt.js";
import { GrindstoneFx } from "../src/grindstone-fx.js";
import { grindstoneCentre } from "../src/grindstone-shape.js";
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
 * What THE GRINDSTONE leaves behind a frame (`grindstone-fx.ts`): grit off a
 * flat at every reversal, a flat's flash as a pass comes clean, the caliper's
 * flare and thud as it bites or a clamp is held home, an axle hit's flash
 * growing hit by hit, the snap free's, the hull's shudder, and where its
 * receipts are thrown. `grindstone-frame.test.ts` has the poses read off the
 * world; this file has what the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const clear = (side: 0 | 1, passes: number): SimEvent => ({
  type: "grindstoneClear",
  side,
  passes,
  col: MID,
});
const hit = (hits: number): SimEvent => ({ type: "grindstoneHit", hits, col: MID });
const bite: SimEvent = { type: "grindstoneBite", col: MID };
const free: SimEvent = { type: "grindstoneFree", col: MID };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: GrindstoneFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: GrindstoneFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE GRINDSTONE's transients", () => {
  it("throws grit off the flat that was rubbed, on its own side, and deals the lighter blow for it", () => {
    const fx = new GrindstoneFx();
    const at = grindstoneCentre(L, CFG);
    const [left] = said(fx, [{ type: "grindstoneShave", side: 0, gritMilli: 500, col: MID }]);
    const [right] = said(fx, [{ type: "grindstoneShave", side: 1, gritMilli: 500, col: MID }]);
    expect(left?.x ?? at.x).toBeLessThan(at.x);
    expect(right?.x ?? at.x).toBeGreaterThan(at.x);
    expect(left?.hex).toBe(PALETTE.grindstoneStoneDark);
    // A shave is a counted reversal, eight to a pass (`boss-hurt.test.ts`).
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
    expect(fx.clean(0)).toBe(0);
  });

  it("flashes a flat as a pass comes clean, that flat only, deals the blow, and forgets it", () => {
    const fx = new GrindstoneFx();
    said(fx, [clear(1, 1)]);
    expect(fx.clean(1)).toBe(1);
    expect(fx.clean(0)).toBe(0);
    expect(fx.hurt.value).toBe(1);
    settle(fx);
    expect(fx.clean(1)).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("flares the caliper and thuds the wheel down as it bites and as a clamp holds, dealing no blow", () => {
    for (const e of [bite, { type: "grindstoneClamp", col: MID } as SimEvent]) {
      const fx = new GrindstoneFx();
      said(fx, [e]);
      expect(fx.flare).toBe(1);
      expect(fx.thud).toBeGreaterThan(0);
      expect(fx.shock.now).toBeGreaterThan(0);
      expect(fx.hurt.value).toBe(0);
      settle(fx);
      expect(fx.flare).toBe(0);
      expect(fx.thud).toBe(0);
      expect(fx.shock.now).toBe(0);
    }
  });

  it("flashes the axle wider for every hit, in the colour the drawer told it", () => {
    const fx = new GrindstoneFx();
    fx.tell(PALETTE.cyanRim);
    const [first] = said(fx, [hit(1)]);
    expect(first?.hex).toBe(PALETTE.cyanRim);
    expect(fx.flash).toEqual({ now: 1, hits: 1 });
    expect(fx.hurt.value).toBe(1);
    const [third] = said(fx, [hit(3)]);
    expect(fx.flash.hits).toBe(3);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    settle(fx);
    expect(fx.flash).toEqual({ now: 0, hits: 0 });
  });

  it("deals nothing for a step lighting, a regrit, a slip or the caliper springing loose", () => {
    const fx = new GrindstoneFx();
    const thrown = said(fx, [
      { type: "grindstoneLight", ask: "left", col: MID },
      { type: "grindstoneRegrit", side: 0, col: MID },
      { type: "grindstoneSlip", side: 1, col: MID },
      { type: "grindstoneLoose", col: MID },
    ]);
    expect(thrown.length).toBe(5);
    expect(fx.hurt.value).toBe(0);
    expect(fx.flare).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a fire step run out to the strike", () => {
    const fx = new GrindstoneFx();
    expect(said(fx, [{ type: "grindstoneMiss", col: MID }])).toEqual([]);
    expect(said(fx, [{ type: "grindstoneOut", col: MID }])).toEqual([]);
    expect(fx.shock.now).toBe(0);
  });

  it("flashes pale and shudders the hull harder as it spins free, and deals no blow for it", () => {
    const fx = new GrindstoneFx();
    said(fx, [bite]);
    const bitten = fx.shock.now;
    said(fx, [free]);
    expect(fx.free).toBe(1);
    expect(fx.shock.now).toBeGreaterThan(bitten);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.free).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new GrindstoneFx();
    said(fx, [clear(0, GRINDSTONE_PASSES_PER_FLAT), bite, hit(2), free]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new GrindstoneFx());
  });
});

const TPB = ticksPerBeat(CFG);

/** The wheel in, the caliper bitten, and a fire step lit. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.grindstoneStillBeats + 1); i++) step(world, []);
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no wheel");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = Math.max(
    0,
    s.steps.findIndex((x) => x.ask === "fire"),
  );
  s.locked = true;
  return world;
}

/** Three frames inside a beat, with `event` thrown on the first tick. */
function frame(role: ViewRole, event: SimEvent | null): string {
  const log: string[] = [];
  runFrames(lit(), role, 9, {
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

describe("THE GRINDSTONE's transients on the field", () => {
  it.each(ROLES)(
    "reacts to a clean pass, the bite, an axle hit and the snap free, on %s",
    (role) => {
      // Every seat is thrown all four: nothing of this boss is split between them.
      const quiet = frame(role, null);
      expect(frame(role, clear(0, 1))).not.toBe(quiet);
      expect(frame(role, bite)).not.toBe(quiet);
      expect(frame(role, hit(1))).not.toBe(quiet);
      expect(frame(role, free)).not.toBe(quiet);
    },
  );
});
