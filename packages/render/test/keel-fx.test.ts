import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  keelBoss,
  midCol,
  NO_ROCK,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { KeelFx } from "../src/keel-fx.js";
import { keelSegCentre, RISE } from "../src/keel-shape.js";
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
 * What THE KEEL leaves behind a frame (`keel-fx.ts`): the jolt of a lock and
 * of the socket shutting, the snap on each seam, the hull's shudder, and where
 * its receipts are thrown. `keel-frame.test.ts` has the poses read off the
 * world; this file has what the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const N = CFG.keelSegments;
const BEAT = 0.5;
const lock = (seg: number): SimEvent => ({ type: "keelLock", seg, loose: N - 1, col: 0 });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: KeelFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

describe("THE KEEL's transients", () => {
  it("jolts the spine and snaps the seam on a lock, and forgets it", () => {
    const fx = new KeelFx();
    said(fx, [lock(2)]);
    expect(fx.jolt).toBeGreaterThan(0);
    expect(fx.snap(2)).toBe(1);
    expect(fx.snap(3)).toBe(0);
    expect(fx.hurt.value).toBe(1);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.jolt).toBe(0);
    expect(fx.snap(2)).toBe(0);
    expect(fx.hurt.value).toBe(0);
    said(fx, [lock(5)]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new KeelFx());
  });

  it("throws a lock's burst over the segment that locked", () => {
    for (const seg of [0, N - 1]) {
      const [b] = said(new KeelFx(), [lock(seg)]);
      const at = keelSegCentre(L, CFG, seg, N, RISE, 0);
      expect(b?.x).toBeCloseTo(at.x, 5);
      expect(b?.y).toBeCloseTo(at.y, 5);
    }
  });

  it("shuts the socket in the colour the drawer told it, and snaps the middle two", () => {
    const fx = new KeelFx();
    fx.tell(PALETTE.cyan);
    const [b] = said(fx, [{ type: "keelShut", col: MID }]);
    expect(b?.hex).toBe(PALETTE.cyan);
    expect(fx.snap(N / 2 - 1)).toBe(1);
    expect(fx.snap(N / 2)).toBe(1);
    expect(fx.snap(0)).toBe(0);
    expect(fx.hurt.value).toBe(1);
  });

  it("deals nothing for a joint lighting, missing or slipping", () => {
    const fx = new KeelFx();
    said(fx, [lock(1)]);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    said(fx, [
      { type: "keelLight", seg: 1, seat: 1, col: 0 },
      { type: "keelMiss", seg: 1, col: 0 },
      { type: "keelSlip", seg: 1, col: 0 },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.jolt).toBe(0);
    expect(fx.snap(1)).toBe(0);
  });

  it("bursts red on the hull where the socket or the rock hit it", () => {
    for (const type of ["keelSocketHit", "keelRockHit"] as const) {
      const [b] = said(new KeelFx(), [{ type, col: 1 }]);
      expect(b?.hex).toBe(PALETTE.red);
      expect(b?.y ?? 0).toBeGreaterThan(L.hullY - L.tile * 2);
    }
  });

  it("shoots the rock out where it had fallen to, not where it was thrown", () => {
    const early = new KeelFx();
    said(early, [{ type: "keelThrow", col: 1 }]);
    const late = new KeelFx();
    said(late, [{ type: "keelThrow", col: 1 }]);
    for (let i = 0; i < 60 * CFG.keelRockBeats * BEAT * 0.75; i++) late.update(1 / 60);
    const out: SimEvent = { type: "keelRockOut", col: 1 };
    const [first] = said(early, [out]);
    const [second] = said(late, [out]);
    const tail = keelSegCentre(L, CFG, N - 1, N, RISE, 0);
    expect(first?.y ?? 0).toBeCloseTo(tail.y, 5);
    expect(second?.y ?? 0).toBeGreaterThan(tail.y + L.tile);
    expect(second?.y ?? 0).toBeLessThan(L.hullY);
  });
});

const TPB = ticksPerBeat(CFG);

/** The spine hung and resting in its first movement, two segments locked. */
function resting(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.movement = 1;
  s.locked = s.locked.map((_, k) => k < 2);
  s.rockCol = NO_ROCK;
  return world;
}

/** Three frames inside a beat, with `event` thrown on the first tick. */
function frame(role: ViewRole, event: SimEvent | null): string {
  const log: string[] = [];
  runFrames(resting(), role, 9, {
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

describe("THE KEEL's transients on the field", () => {
  it.each(ROLES)("reacts to a lock and to the rock hitting the hull, on %s", (role) => {
    // Every seat is thrown both: nothing of this boss is split between them.
    const quiet = frame(role, null);
    expect(frame(role, lock(1))).not.toBe(quiet);
    expect(frame(role, { type: "keelRockHit", col: 1 })).not.toBe(quiet);
  });
});
