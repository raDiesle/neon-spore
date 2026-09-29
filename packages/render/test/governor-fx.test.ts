import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { midCol, type SimEvent, type World } from "@neon-spore/sim";
import { BossHurt, JAB_SHAKE } from "../src/boss-hurt.js";
import { GovernorFx } from "../src/governor-fx.js";
import { TILT_READ } from "../src/governor-pose.js";
import { dialAt, governorDial, TRACK_OUT } from "../src/governor-shape.js";
import { GOVERNOR_MARK } from "../src/governor-verdicts.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, FIRE, frame, posed, TAP } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE GOVERNOR leaves behind a frame (`governor-fx.ts`): a flash on the
 * rim where each tap landed, a skid's scrape behind the needle, the hub's
 * flash growing hit by hit, the hull's shudder, the marks' verdicts, and
 * where its receipts are thrown. `governor-frame.test.ts` has the poses read
 * off the world; this file has what the events add to them, on every screen.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const col = midCol(CFG);
const BEAT = 0.5;
const D = governorDial(L, CFG, TILT_READ);
const light = (markMilli: number): SimEvent => ({
  type: "governorLight",
  ask: "tap",
  markMilli,
  col,
});
const tick = (taps: number): SimEvent => ({ type: "governorTick", side: 0, taps, col });
const skid: SimEvent = { type: "governorSkid", side: 0, col };
const hit = (hits: number): SimEvent => ({ type: "governorHit", hits, col });
const hub: SimEvent = { type: "governorHub", col };
const spent: SimEvent = { type: "governorSpent", col };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: GovernorFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: GovernorFx): void {
  for (let i = 0; i < 120; i++) fx.update(1 / 60);
}

describe("THE GOVERNOR's transients", () => {
  it("flashes the rim at the mark the step lit, and deals the lighter blow for a tap inside a run", () => {
    const fx = new GovernorFx();
    said(fx, [light(250)]);
    const [thrown] = said(fx, [tick(1)]);
    const at = dialAt(D, 250, TRACK_OUT);
    expect(thrown).toMatchObject({ x: at.x, y: at.y, hex: PALETTE.hullRim });
    expect(fx.tap).toEqual({ now: 1, milli: 250 });
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
    settle(fx);
    expect(fx.tap.now).toBe(0);
  });

  it("deals the whole blow for a run's third tap and for a retap", () => {
    for (const e of [tick(3), { type: "governorRetap", side: 1, col } as SimEvent]) {
      const fx = new GovernorFx();
      said(fx, [e]);
      expect(fx.hurt.shake, e.type).toBe(1);
      expect(fx.tap.now, e.type).toBe(1);
    }
  });

  it("scrapes the track where the needle was last drawn, dull, and deals nothing", () => {
    const fx = new GovernorFx();
    fx.note(640, PALETTE.hullRim);
    const [thrown] = said(fx, [skid]);
    expect(fx.scrape).toEqual({ now: 1, milli: 640 });
    expect(thrown?.hex).toBe(PALETTE.rockDark);
    expect(fx.hurt.value).toBe(0);
    expect(fx.tap.now).toBe(0);
    expect(fx.verdicts.at(GOVERNOR_MARK)?.good).toBe(false);
    settle(fx);
    expect(fx.scrape.now).toBe(0);
  });

  it("flashes the hub wider for every hit, in the colour the drawer told it", () => {
    const fx = new GovernorFx();
    fx.note(0, PALETTE.cyanRim);
    const [first] = said(fx, [hit(1)]);
    expect(first).toMatchObject({ x: D.cx, y: D.cy, hex: PALETTE.cyanRim });
    expect(fx.flash).toEqual({ now: 1, hits: 1 });
    expect(fx.hurt.value).toBe(1);
    const [third] = said(fx, [hit(3)]);
    expect(fx.flash.hits).toBe(3);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    settle(fx);
    expect(fx.flash).toEqual({ now: 0, hits: 0 });
  });

  it("shudders the hull as the hub lights and harder as it is spent, and deals nothing for either", () => {
    const fx = new GovernorFx();
    said(fx, [hub]);
    const lit = fx.shock.now;
    expect(lit).toBeGreaterThan(0);
    said(fx, [spent]);
    expect(fx.shock.now).toBeGreaterThan(lit);
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.shock.now).toBe(0);
  });

  it("deals nothing for a step lighting, a chord planted or slipped, a sway or a dim", () => {
    const fx = new GovernorFx();
    said(fx, [
      light(250),
      { type: "governorPlant", side: 1, col },
      { type: "governorSlip", side: 1, col },
      { type: "governorSway", col },
      { type: "governorDim", col },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.tap.now).toBe(0);
    expect(fx.flash.now).toBe(0);
  });

  it("leaves a fire step run out to the strike", () => {
    const fx = new GovernorFx();
    expect(said(fx, [{ type: "governorMiss", col }])).toEqual([]);
    expect(said(fx, [{ type: "governorOut", col }])).toEqual([]);
    expect(fx.shock.now).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new GovernorFx();
    fx.note(640, PALETTE.red);
    said(fx, [light(250), tick(2), skid, hub, hit(2), spent]);
    fx.clear();
    expect(fx).toEqual(new GovernorFx());
  });
});

/**
 * How many strokes a pose's frames lay, with the verdicts and the blow held
 * off, so what differs is the receipt itself and not the ring or the red a
 * word also brings — and strokes, because the sparks it throws only fill.
 */
function receipt(role: ViewRole, arrange: (w: World) => void, thrown?: SimEvent): number {
  const off = [
    spyOn(GripVerdicts.prototype, "mark").mockImplementation(() => {}),
    spyOn(BossHurt.prototype, "hit").mockImplementation(() => {}),
    spyOn(BossHurt.prototype, "jab").mockImplementation(() => {}),
  ];
  try {
    return count(frame(role, arrange, thrown), "set strokeStyle=");
  } finally {
    for (const spy of off) spy.mockRestore();
  }
}

describe("THE GOVERNOR's transients, drawn", () => {
  const tapping = (w: World) => {
    posed(w, TAP, 250);
  };
  const firing = (w: World) => {
    posed(w, FIRE, 0, (s) => {
      s.hubLit = true;
    });
  };

  it.each(ROLES)("a tap draws its flash on the rim on the %s screen", (role) => {
    expect(receipt(role, tapping, tick(1))).toBeGreaterThan(receipt(role, tapping));
  });

  it.each(ROLES)("a skid draws its scrape on the %s screen", (role) => {
    expect(receipt(role, tapping, skid)).toBeGreaterThan(receipt(role, tapping));
  });

  it.each(ROLES)("a hub hit draws its flash on the %s screen", (role) => {
    expect(receipt(role, firing, hit(1))).toBeGreaterThan(receipt(role, firing));
  });
});
