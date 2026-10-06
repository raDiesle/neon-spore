import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent, type World } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import { FlueFx } from "../src/flue-fx.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { BOLT, frame, posed } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE FLUE leaves behind a frame (`flue-fx.ts`): the flash at the sight
 * as the ember is met, the flare of the level's stud, the red sting where a shot
 * was spent, the hull's shudder as it goes cold, and where its receipts are
 * thrown. `flue-frame.test.ts` has the poses read off the world; this file
 * has what the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const hit = (hits: number): SimEvent => ({ type: "flueHit", hits, col: MID });
const miss = (shots: number): SimEvent => ({ type: "flueMiss", shots, why: "wide", col: MID });
const spent: SimEvent = { type: "flueSpent", col: MID };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: FlueFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: FlueFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE FLUE's transients", () => {
  it("flashes the sight and flares the stud as a level is cleared, and deals the blow", () => {
    const fx = new FlueFx();
    const [thrown] = said(fx, [hit(1)]);
    expect(thrown).toMatchObject({ x: fieldX(L, MID), hex: PALETTE.hullRim });
    expect(fx.flash).toBe(1);
    expect(fx.flare).toBe(1);
    expect(fx.hurt.value).toBe(1);
    settle(fx);
    expect(fx.flash).toBe(0);
    expect(fx.flare).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("stings red under the flue for a shot spent, and deals the flue nothing", () => {
    const fx = new FlueFx();
    const [sting] = said(fx, [miss(2)]);
    expect(sting?.hex).toBe(PALETTE.red);
    expect(sting?.y ?? 0).toBeGreaterThan(L.tile * CFG.flueRow);
    expect(fx.sting).toBe(1);
    expect(fx.hurt.value).toBe(0);
    expect(fx.flash).toBe(0);
    settle(fx);
    expect(fx.sting).toBe(0);
  });

  it("deals nothing for the flue entering or a level lighting", () => {
    const fx = new FlueFx();
    said(fx, [
      { type: "flueEnter", col: MID },
      { type: "flueLight", level: 0, col: MID },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.flash).toBe(0);
    expect(fx.shock.now).toBe(0);
  });

  it("leaves the third shot's blow and the flue going to the strike and the out", () => {
    const fx = new FlueFx();
    expect(said(fx, [{ type: "flueOut", col: MID }])).toEqual([]);
    expect(fx.shock.now).toBe(0);
  });

  it("shudders the hull as it goes cold for good", () => {
    const fx = new FlueFx();
    said(fx, [spent]);
    expect(fx.shock.now).toBeGreaterThan(0);
    settle(fx);
    expect(fx.shock.now).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new FlueFx();
    said(fx, [hit(2), miss(1), spent]);
    fx.clear();
    expect(fx).toEqual(new FlueFx());
  });
});

describe("THE FLUE's transients, drawn", () => {
  const lit = (w: World) => {
    posed(w, BOLT);
  };

  it.each(ROLES)("a level cleared draws its flash on the %s screen", (role) => {
    expect(frame(role, lit, hit(1))).not.toBe(frame(role, lit));
  });
});
