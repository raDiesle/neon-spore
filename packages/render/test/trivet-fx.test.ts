import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type SimEvent,
  startWave,
  step,
  TRIVET_PLANTS_PER_FOOT,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { TrivetFx } from "../src/trivet-fx.js";
import { trivetCentre } from "../src/trivet-shape.js";
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
 * What THE TRIVET leaves behind a frame (`trivet-fx.ts`): the thud of a foot
 * driven home, a clamp's flare as it snaps shut, a hub hit's flash growing
 * hit by hit, the collapse's, the hull's shudder, and where its receipts are
 * thrown. `trivet-frame.test.ts` has the poses read off the world; this file
 * has what the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const plant = (side: 0 | 1, level: number): SimEvent => ({
  type: "trivetPlant",
  side,
  level,
  col: MID,
});
const hit = (hits: number): SimEvent => ({ type: "trivetHit", hits, col: MID });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: TrivetFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

describe("THE TRIVET's transients", () => {
  it("thuds the stand down on a plant, at the foot that bit, deals the blow, and forgets it", () => {
    const fx = new TrivetFx();
    const at = trivetCentre(L, CFG);
    const [front] = said(fx, [plant(0, 1)]);
    const [rear] = said(fx, [plant(1, 1)]);
    expect(front?.x ?? at.x).toBeLessThan(at.x);
    expect(rear?.x ?? at.x).toBeGreaterThan(at.x);
    expect(front?.y ?? at.y).toBeGreaterThan(at.y);
    expect(fx.thud).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(1);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.thud).toBe(0);
    expect(fx.hurt.value).toBe(0);
    said(fx, [plant(1, TRIVET_PLANTS_PER_FOOT), hit(2), { type: "trivetCollapse", col: MID }]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new TrivetFx());
  });

  it("flares a clamp only on the plant that locks it, that foot only, and lets it fade", () => {
    const fx = new TrivetFx();
    said(fx, [plant(0, 1)]);
    expect(fx.snap(0)).toBe(0);
    said(fx, [plant(0, TRIVET_PLANTS_PER_FOOT)]);
    expect(fx.snap(0)).toBe(1);
    expect(fx.snap(1)).toBe(0);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.snap(0)).toBe(0);
  });

  it("flashes the hub wider for every hit, in the colour the drawer told it", () => {
    const fx = new TrivetFx();
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

  it("deals nothing for a step lighting, a slip, a spring, the hub lighting, a brace or a rock", () => {
    const fx = new TrivetFx();
    const thrown = said(fx, [
      { type: "trivetLight", ask: "front", col: MID },
      { type: "trivetSlip", side: 0, col: MID },
      { type: "trivetSpring", side: 1, col: MID },
      { type: "trivetHub", col: MID },
      { type: "trivetBrace", col: MID },
      { type: "trivetRock", col: MID },
    ]);
    expect(thrown.length).toBe(7);
    expect(fx.hurt.value).toBe(0);
    expect(fx.thud).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a missed hub's blow at the hull to the strike", () => {
    const fx = new TrivetFx();
    expect(said(fx, [{ type: "trivetMiss", col: MID }])).toEqual([]);
    expect(said(fx, [{ type: "trivetOut", col: MID }])).toEqual([]);
    expect(fx.thud).toBe(0);
  });

  it("flashes the hub pale as the stand collapses, and deals no blow for it", () => {
    const fx = new TrivetFx();
    said(fx, [{ type: "trivetCollapse", col: MID }]);
    expect(fx.collapse).toBe(1);
    expect(fx.hurt.value).toBe(0);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.collapse).toBe(0);
  });
});

const TPB = ticksPerBeat(CFG);

/** The stand down, the front foot already clamped, and the first step lit. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.feet = [TRIVET_PLANTS_PER_FOOT, 0];
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

describe("THE TRIVET's transients on the field", () => {
  it.each(ROLES)("reacts to a plant, a hub hit and the collapse, on %s", (role) => {
    // Every seat is thrown all three: nothing of this boss is split between them.
    const quiet = frame(role, null);
    expect(frame(role, plant(0, TRIVET_PLANTS_PER_FOOT))).not.toBe(quiet);
    expect(frame(role, hit(1))).not.toBe(quiet);
    expect(frame(role, { type: "trivetCollapse", col: MID })).not.toBe(quiet);
  });
});
