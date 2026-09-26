import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { ViseFx } from "../src/vise-fx.js";
import { viseCentre } from "../src/vise-shape.js";
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
 * What THE VISE leaves behind a frame (`vise-fx.ts`): the dry thud of a
 * crack, a sprung lobe ringing down, a kernel hit's flash growing hit by hit,
 * the split's, the hull's shudder, and where its receipts are thrown.
 * `vise-frame.test.ts` has the poses read off the world; this file has what
 * the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const crack = (side: 0 | 1): SimEvent => ({ type: "viseCrack", side, cracks: 1, col: MID });
const hit = (hits: number): SimEvent => ({ type: "viseHit", hits, col: MID });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: ViseFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

describe("THE VISE's transients", () => {
  it("thuds the case down on a crack, off the lobe that gave, deals the blow, and forgets it", () => {
    const fx = new ViseFx();
    const at = viseCentre(L, CFG);
    const [left] = said(fx, [crack(0)]);
    const [right] = said(fx, [crack(1)]);
    expect(left?.x ?? at.x).toBeLessThan(at.x);
    expect(right?.x ?? at.x).toBeGreaterThan(at.x);
    expect(left?.hex).toBe(PALETTE.viseCrack);
    expect(fx.thud).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(1);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.thud).toBe(0);
    expect(fx.hurt.value).toBe(0);
    said(fx, [hit(2), { type: "viseSpring", side: 1, col: MID }, { type: "viseSplit", col: MID }]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new ViseFx());
  });

  it("throws a sprung lobe open past its rest, that lobe only, and lets it settle", () => {
    const fx = new ViseFx();
    said(fx, [{ type: "viseSpring", side: 0, col: MID }]);
    expect(fx.spring(0)).toBeGreaterThan(0);
    expect(fx.spring(1)).toBe(0);
    expect(fx.hurt.value).toBe(0);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.spring(0)).toBe(0);
  });

  it("flashes the kernel wider for every hit, in the colour the drawer told it", () => {
    const fx = new ViseFx();
    fx.tell(PALETTE.cyanRim);
    const [first] = said(fx, [hit(1)]);
    expect(first?.hex).toBe(PALETTE.cyanRim);
    expect(fx.flash).toEqual({ now: 1, hits: 1 });
    expect(fx.hurt.value).toBe(1);
    const [third] = said(fx, [hit(3)]);
    expect(fx.flash.hits).toBe(3);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.flash).toEqual({ now: 0, hits: 0 });
  });

  it("deals nothing for a step lighting, a slip, a spring, a brace or the kernel covered", () => {
    const fx = new ViseFx();
    said(fx, [
      { type: "viseLight", ask: "left", col: MID },
      { type: "viseSlip", side: 0, col: MID },
      { type: "viseSpring", side: 1, col: MID },
      { type: "viseBrace", col: MID },
      { type: "viseCover", col: MID },
      { type: "viseBare", col: MID },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.thud).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a missed kernel's blow at the hull to the strike", () => {
    const fx = new ViseFx();
    expect(said(fx, [{ type: "viseMiss", col: MID }])).toEqual([]);
    expect(said(fx, [{ type: "viseOut", col: MID }])).toEqual([]);
    expect(fx.thud).toBe(0);
  });

  it("flashes the whole case as it splits", () => {
    const fx = new ViseFx();
    said(fx, [{ type: "viseSplit", col: MID }]);
    expect(fx.split).toBe(1);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.split).toBe(0);
  });
});

const TPB = ticksPerBeat(CFG);

/** The case stood and the first pinch lit. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
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

describe("THE VISE's transients on the field", () => {
  it.each(ROLES)("reacts to a crack, a spring and a kernel hit, on %s", (role) => {
    // Every seat is thrown all three: nothing of this boss is split between them.
    const quiet = frame(role, null);
    expect(frame(role, crack(0))).not.toBe(quiet);
    expect(frame(role, { type: "viseSpring", side: 1, col: MID })).not.toBe(quiet);
    expect(frame(role, hit(1))).not.toBe(quiet);
  });
});
