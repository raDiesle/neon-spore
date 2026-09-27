import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent, type World } from "@neon-spore/sim";
import { JAB_SHAKE } from "../src/boss-hurt.js";
import { fieldX } from "../src/field-flip.js";
import { FlueFx } from "../src/flue-fx.js";
import { FLUE_DAMPER, flueCentre, flueUnitAt } from "../src/flue-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { FIRE, frame, posed, rested, VENT } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE FLUE leaves behind a frame (`flue-fx.ts`): a tick through the slot
 * for every tap, a vent notch's flare, the damper's thud, the core's flash
 * growing hit by hit, the hull's shudder, and where its receipts are thrown.
 * `flue-frame.test.ts` has the poses read off the world; this file has what
 * the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const MID = midCol(CFG);
const BEAT = 0.5;
const tick = (col: number): SimEvent => ({ type: "flueTick", side: 1, taps: 1, col });
const vent = (vents: number): SimEvent => ({ type: "flueVent", vents, col: MID });
const hit = (hits: number): SimEvent => ({ type: "flueHit", hits, col: MID });
const bare: SimEvent = { type: "flueBare", col: MID };
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
  it("ticks for a tap, over the column tapped, and deals the lighter blow for it", () => {
    const fx = new FlueFx();
    const [thrown] = said(fx, [tick(MID - 1)]);
    expect(thrown?.x).toBe(fieldX(L, MID - 1));
    expect(thrown?.hex).toBe(PALETTE.hullRim);
    expect(fx.tick).toBe(1);
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
    settle(fx);
    expect(fx.tick).toBe(0);
  });

  it("flashes off the ember as a lapse throws the taps away, and deals nothing", () => {
    const fx = new FlueFx();
    said(fx, [{ type: "flueLapse", side: 1, taps: 2, col: MID }]);
    expect(fx.lapse).toBe(1);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.lapse).toBe(0);
  });

  it("flares the notch of the vent just spent, that end only, and deals the blow", () => {
    const fx = new FlueFx();
    const [first] = said(fx, [vent(1)]);
    expect(fx.flare(0)).toBe(1);
    expect(fx.flare(1)).toBe(0);
    expect(first?.x ?? 0).toBeLessThan(flueCentre(L, CFG).x);
    expect(fx.hurt.value).toBe(1);
    said(fx, [vent(2)]);
    expect(fx.flare(1)).toBe(1);
    settle(fx);
    expect(fx.flare(0)).toBe(0);
    expect(fx.hurt.value).toBe(0);
  });

  it("thuds the damper as the core is bared, shuddering the hull, and deals no blow for it", () => {
    const fx = new FlueFx();
    said(fx, [bare]);
    expect(fx.thud).toBeGreaterThan(0);
    expect(fx.shock.now).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.thud).toBe(0);
    expect(fx.shock.now).toBe(0);
  });

  it("thuds the damper held by both hands, and that is a step landed", () => {
    const fx = new FlueFx();
    said(fx, [{ type: "flueHeld", col: MID }]);
    expect(fx.thud).toBeGreaterThan(0);
    expect(fx.hurt.value).toBe(1);
  });

  it("flashes the core wider for every hit, in the colour the drawer told it", () => {
    const fx = new FlueFx();
    fx.tell(PALETTE.cyanRim);
    const [first] = said(fx, [hit(1)]);
    const core = flueUnitAt(L, CFG, FLUE_DAMPER);
    expect(first).toMatchObject({ x: core.x, y: core.y, hex: PALETTE.cyanRim });
    expect(fx.flash).toEqual({ now: 1, hits: 1 });
    const [third] = said(fx, [hit(3)]);
    expect(fx.flash.hits).toBe(3);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    settle(fx);
    expect(fx.flash).toEqual({ now: 0, hits: 0 });
  });

  it("deals nothing for a step lighting, the ember steadying or stirring, a skid, a lapse, a choke or a shut", () => {
    const fx = new FlueFx();
    said(fx, [
      { type: "flueLight", ask: "vent", col: MID },
      { type: "flueSteady", col: MID },
      { type: "flueStir", side: 0, col: MID },
      { type: "flueSkid", side: 1, col: MID },
      { type: "flueLapse", side: 1, taps: 2, col: MID },
      { type: "flueChoke", col: MID },
      { type: "flueShut", col: MID },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.tick).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a fire step run out to the strike", () => {
    const fx = new FlueFx();
    expect(said(fx, [{ type: "flueMiss", col: MID }])).toEqual([]);
    expect(said(fx, [{ type: "flueOut", col: MID }])).toEqual([]);
    expect(fx.shock.now).toBe(0);
  });

  it("shudders the hull harder as it swings open for good than as the core is bared", () => {
    const fx = new FlueFx();
    said(fx, [bare]);
    const bared = fx.shock.now;
    said(fx, [spent]);
    expect(fx.shock.now).toBeGreaterThan(bared);
    expect(fx.hurt.value).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new FlueFx();
    said(fx, [
      tick(MID),
      { type: "flueLapse", side: 1, taps: 1, col: MID },
      vent(2),
      bare,
      hit(2),
      spent,
    ]);
    fx.tell(PALETTE.red);
    fx.clear();
    expect(fx).toEqual(new FlueFx());
  });
});

describe("THE FLUE's transients, drawn", () => {
  const steadied = (w: World) => {
    posed(w, VENT, 0, rested(2));
  };
  const bared = (w: World) => {
    posed(w, FIRE, 0, (s) => {
      s.bared = true;
    });
  };

  it.each(ROLES)("a tap on a steadied ember draws its tick on the %s screen", (role) => {
    expect(frame(role, steadied, tick(MID))).not.toBe(frame(role, steadied));
  });

  it.each(ROLES)("a core hit draws its flash on the %s screen", (role) => {
    expect(frame(role, bared, hit(1))).not.toBe(frame(role, bared));
  });
});
