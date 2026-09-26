import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  oculusBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { OculusFx } from "../src/oculus-fx.js";
import { oculusCentre } from "../src/oculus-shape.js";
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
 * What THE OCULUS leaves behind a frame (`oculus-fx.ts`): the thud of a shut
 * pair and of a reseal, a core hit's flash growing hit by hit, the shatter's,
 * the hull's shudder, and where its receipts are thrown. `oculus-frame.test.ts`
 * has the poses read off the world; this file has what the events add to them,
 * on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const shut: SimEvent = { type: "oculusShut", shut: 2, col: MID };
const hit = (hits: number): SimEvent => ({ type: "oculusHit", hits, col: MID });

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: OculusFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

describe("THE OCULUS's transients", () => {
  it("thuds the lens down on a shut pair, deals the blow, and forgets it", () => {
    const fx = new OculusFx();
    const [b] = said(fx, [shut]);
    const at = oculusCentre(L, CFG);
    expect(b?.x).toBeCloseTo(at.x, 5);
    expect(b?.y).toBeCloseTo(at.y, 5);
    expect(fx.thud).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(1);
    for (let i = 0; i < 120; i++) fx.update(1 / 60);
    expect(fx.thud).toBe(0);
    expect(fx.hurt.value).toBe(0);
    said(fx, [hit(2), { type: "oculusShatter", col: MID }]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new OculusFx());
  });

  it("thuds a reseal quieter than a shut pair, and deals nothing for it", () => {
    const loud = new OculusFx();
    said(loud, [shut]);
    const quiet = new OculusFx();
    said(quiet, [{ type: "oculusReseal", col: MID }]);
    expect(quiet.thud).toBeGreaterThan(0);
    expect(quiet.thud).toBeLessThan(loud.thud);
    expect(quiet.hurt.value).toBe(0);
  });

  it("flashes the core wider for every hit, in the colour the drawer told it", () => {
    const fx = new OculusFx();
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

  it("deals nothing for a step lighting, a thumb slipping, a pair springing or the socket swallowed", () => {
    const fx = new OculusFx();
    said(fx, [
      { type: "oculusLight", ask: "shut", col: MID },
      { type: "oculusSlip", col: MID },
      { type: "oculusSpring", col: MID },
      { type: "oculusSwallow", col: MID },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.thud).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a missed core's blow at the hull to the strike", () => {
    const fx = new OculusFx();
    expect(said(fx, [{ type: "oculusMiss", col: MID }])).toEqual([]);
    expect(fx.thud).toBe(0);
  });

  it("flashes the whole lens as it shatters", () => {
    const fx = new OculusFx();
    said(fx, [{ type: "oculusShatter", col: MID }]);
    expect(fx.shatter).toBe(1);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.shatter).toBe(0);
  });
});

const TPB = ticksPerBeat(CFG);

/** The lens stood and the first pair lit. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.oculusStillBeats + 1); i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
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

describe("THE OCULUS's transients on the field", () => {
  it.each(ROLES)("reacts to a shut pair and to a core hit, on %s", (role) => {
    // Every seat is thrown both: nothing of this boss is split between them.
    const quiet = frame(role, null);
    expect(frame(role, shut)).not.toBe(quiet);
    expect(frame(role, hit(1))).not.toBe(quiet);
  });
});
