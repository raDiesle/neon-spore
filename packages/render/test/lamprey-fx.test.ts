import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { midCol, type SimEvent, type World } from "@neon-spore/sim";
import { BossHurt, JAB_SHAKE } from "../src/boss-hurt.js";
import { fieldX } from "../src/field-flip.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { LampreyFx } from "../src/lamprey-fx.js";
import { lampreyPose } from "../src/lamprey-pose.js";
import { lampreyToothAt } from "../src/lamprey-shape.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { stepColour } from "../src/step-colour.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { BITE, count, frame, GULLET, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE LAMPREY leaves behind a frame (`lamprey-fx.ts`): the tooth a crack
 * knocks out, flung from where it stood; the ring snapping shut on a tooth
 * that went back in; the gullet's gulp in the colour it reared in; the
 * hull's shudder as a bite goes through; the blow; and where its receipts
 * are thrown. This file has
 * what the events add to the eel `lamprey-draw.ts` reads off the world.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const col = midCol(CFG);
const BEAT = 0.5;
const crack = (tooth: number): SimEvent => ({ type: "lampreyCrack", side: 1, tooth, col });
const snap = (tooth: number): SimEvent => ({ type: "lampreySnap", tooth, side: 1, col });
const hit = (hits: number): SimEvent => ({ type: "lampreyHit", hits, col });
const bite: SimEvent = { type: "lampreyBite", side: 0, tooth: 0, row: 6, col };
const full: SimEvent = { type: "lampreyFull", col };
const loose: SimEvent = { type: "lampreyLoose", tooth: 0, col };
const spent: SimEvent = { type: "lampreySpent", col };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: LampreyFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: LampreyFx): void {
  for (let i = 0; i < 180; i++) fx.update(1 / 60);
}

/** The eel bitten into BITE's tile, as the drawer would hand it over. */
function noted(fx: LampreyFx) {
  const world = stood();
  const s = posed(world);
  const p = lampreyPose(L, CFG, s, world.beat, 0);
  fx.note(p);
  return p;
}

describe("THE LAMPREY's transients", () => {
  it("flings a cracked tooth out from where it stood, and deals the lighter blow", () => {
    const fx = new LampreyFx();
    const p = noted(fx);
    const [thrown] = said(fx, [crack(2)]);
    const at = lampreyToothAt(p, 2);
    expect(thrown).toMatchObject({ x: at.x, y: at.y, hex: PALETTE.lampreyTooth });
    expect(fx.flung.now).toBe(1);
    expect(fx.flung.at).toEqual(at);
    expect(Math.hypot(fx.flung.dir.x, fx.flung.dir.y)).toBeCloseTo(1, 9);
    // Out from the mouth's middle: the same way as the tooth stands from it.
    expect(Math.sign(fx.flung.dir.x)).toBe(Math.sign(at.x - p.x));
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
    settle(fx);
    expect(fx.flung.now).toBe(0);
  });

  it("before the first frame, throws on the hull over the event's column", () => {
    const fx = new LampreyFx();
    const [thrown] = said(fx, [crack(3)]);
    expect(thrown).toMatchObject({ x: fieldX(L, col), y: L.hullY });
    expect(fx.flung.dir).toEqual({ x: 0, y: -1 });
  });

  it("snaps a ring shut on the tooth that went back in, and deals nothing", () => {
    const fx = new LampreyFx();
    noted(fx);
    said(fx, [snap(4)]);
    expect(fx.snap).toEqual({ now: 1, tooth: 4 });
    expect(fx.hurt.value).toBe(0);
    settle(fx);
    expect(fx.snap.now).toBe(0);
  });

  it("gulps in the colour it reared in, wider for every hit, and deals the whole blow", () => {
    const fx = new LampreyFx();
    noted(fx);
    said(fx, [{ type: "lampreyRear", color: "cyan", col }]);
    const [first] = said(fx, [hit(1)]);
    const lit = stepColour("cyan").rim;
    expect(first?.hex).toBe(lit);
    expect(fx.gulp).toEqual({ now: 1, hits: 1, hex: lit });
    expect(fx.hurt.shake).toBe(1);
    const [third] = said(fx, [hit(3)]);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    settle(fx);
    expect(fx.gulp.now).toBe(0);
    expect(fx.gulp.hits).toBe(0);
  });

  it("deals the whole blow when the head comes off its tile", () => {
    const fx = new LampreyFx();
    said(fx, [loose]);
    expect(fx.hurt.shake).toBe(1);
  });

  it("shudders the hull as a bite goes through and as it is spent, and deals nothing for either", () => {
    const torn = new LampreyFx();
    said(torn, [full]);
    expect(torn.shock.now).toBeGreaterThan(0);
    expect(torn.hurt.value).toBe(0);
    const gone = new LampreyFx();
    said(gone, [spent]);
    expect(gone.shock.now).toBeGreaterThan(0);
    expect(gone.hurt.value).toBe(0);
    settle(torn);
    expect(torn.shock.now).toBe(0);
  });

  it("deals nothing for a bite, a grip, a slip or a rear", () => {
    const fx = new LampreyFx();
    said(fx, [
      bite,
      { type: "lampreyGrip", side: 0, col },
      { type: "lampreySlip", side: 1, col },
      { type: "lampreyRear", color: "red", col },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.shock.now).toBe(0);
    expect(fx.flung.now + fx.snap.now + fx.gulp.now).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new LampreyFx();
    noted(fx);
    said(fx, [bite, crack(1), snap(2), { type: "lampreyRear", color: "red", col }, hit(2), spent]);
    fx.clear();
    expect(fx).toEqual(new LampreyFx());
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

describe("THE LAMPREY's transients, drawn", () => {
  const biting = (w: World) => {
    posed(w, "bite", BITE);
  };
  const reared = (w: World) => {
    posed(w, "rearing", GULLET);
  };

  it.each(ROLES)("a crack draws its flung tooth on the %s screen", (role) => {
    expect(receipt(role, biting, crack(0))).toBeGreaterThan(receipt(role, biting));
  });

  it.each(ROLES)("a snap draws its ring on the %s screen", (role) => {
    expect(receipt(role, biting, snap(0))).toBeGreaterThan(receipt(role, biting));
  });

  it.each(ROLES)("a hit draws its gulp on the %s screen", (role) => {
    expect(receipt(role, reared, hit(1))).toBeGreaterThan(receipt(role, reared));
  });
});
