import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { midCol, type SimEvent, type World } from "@neon-spore/sim";
import { BossHurt, JAB_SHAKE } from "../src/boss-hurt.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { MimicFx } from "../src/mimic-fx.js";
import { mimicHang, mimicPose, mimicSignAt } from "../src/mimic-pose.js";
import { PALETTE } from "../src/palette.js";
import { stepColour } from "../src/step-colour.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { CORE, count, frame, posed, SIGN, SPLIT, stood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * What THE MIMIC leaves behind a frame (`mimic-fx.ts`): the sign a peel
 * lifts off, from where it was worn; the core's flash in the colour it was
 * lit; the hull's shudder; the blow; and where its receipts are thrown. This
 * file has what the events add to the mantle `mimic-draw.ts` reads off the
 * world.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const col = midCol(CFG);
const BEAT = 0.5;
const peel = (side: 0 | 1, sign: number): SimEvent => ({
  type: "mimicPeel",
  side,
  sign,
  peels: 1,
  col,
});
const hit = (hits: number): SimEvent => ({ type: "mimicHit", hits, col });
const core: SimEvent = { type: "mimicCore", color: "cyan", col };
const enter: SimEvent = { type: "mimicEnter", col };
const spent: SimEvent = { type: "mimicSpent", col };

interface Thrown {
  x: number;
  y: number;
  n: number;
  hex: string;
}

function said(fx: MimicFx, events: SimEvent[]): Thrown[] {
  const out: Thrown[] = [];
  fx.ingest(events, L, CFG, BEAT, (x, y, n, hex) => out.push({ x, y, n, hex }));
  return out;
}

function settle(fx: MimicFx): void {
  for (let i = 0; i < 180; i++) fx.update(1 / 60);
}

/** The mantle posed on `lit`, as the drawer would hand it over. */
function noted(fx: MimicFx, lit = SIGN) {
  const world = stood();
  const s = posed(world, "sign", lit);
  const p = mimicPose(L, CFG, s, world.beat, 0);
  fx.note(p);
  return p;
}

describe("THE MIMIC's transients", () => {
  it("lifts a peeled sign off where it was worn, and deals the lighter blow", () => {
    const fx = new MimicFx();
    const p = noted(fx);
    const [thrown] = said(fx, [peel(1, 3)]);
    const at = mimicSignAt(L, p, false, 2);
    expect(thrown).toMatchObject({ x: at.x, y: at.y, hex: PALETTE.mimicSign });
    expect(fx.peel).toMatchObject({ now: 1, sign: 3, x: at.x, y: at.y, size: at.size });
    expect(fx.hurt.value).toBe(1);
    expect(fx.hurt.shake).toBe(JAB_SHAKE);
    settle(fx);
    expect(fx.peel.now).toBe(0);
  });

  it("on a split, lifts each seat's sign off its own half and drifts it outward", () => {
    const fx = new MimicFx();
    const p = noted(fx, SPLIT);
    for (const side of [0, 1] as const) {
      said(fx, [peel(side, 1)]);
      const at = mimicSignAt(L, p, true, (side + 1) as 1 | 2);
      expect(fx.peel.x).toBe(at.x);
      expect(fx.peel.side).toBe(at.x < p.x ? -1 : 1);
    }
  });

  it("before the first frame, throws where the mantle hangs", () => {
    const fx = new MimicFx();
    const [thrown] = said(fx, [enter]);
    expect(thrown).toMatchObject(mimicHang(L, CFG));
  });

  it("flashes the core in the colour it was lit, harder for every hit, and deals the whole blow", () => {
    const fx = new MimicFx();
    noted(fx);
    said(fx, [core]);
    const [first] = said(fx, [hit(1)]);
    const lit = stepColour("cyan").rim;
    expect(first?.hex).toBe(lit);
    expect(fx.flash).toEqual({ now: 1, hex: lit });
    expect(fx.hurt.shake).toBe(1);
    const [third] = said(fx, [hit(3)]);
    expect(third?.n ?? 0).toBeGreaterThan(first?.n ?? 0);
    settle(fx);
    expect(fx.flash.now).toBe(0);
  });

  it("shudders the hull as it slaps into shape, harder as it falls spent, and deals nothing for either", () => {
    const slap = new MimicFx();
    said(slap, [enter]);
    const fall = new MimicFx();
    said(fall, [spent]);
    expect(slap.shock.now).toBeGreaterThan(0);
    expect(fall.shock.now).toBeGreaterThan(slap.shock.now);
    expect(slap.hurt.value + fall.hurt.value).toBe(0);
    settle(slap);
    expect(slap.shock.now).toBe(0);
  });

  it("throws a wrong sign in the hull's red, and deals nothing for it or the rest", () => {
    const fx = new MimicFx();
    noted(fx);
    const [wrong] = said(fx, [{ type: "mimicWrong", side: 1, drawn: 2, sign: 0, col }]);
    expect(wrong?.hex).toBe(PALETTE.red);
    said(fx, [
      { type: "mimicSign", signs: [-1, 0], col },
      { type: "mimicChange", signs: [-1, 1], col },
      { type: "mimicLapse", col },
      { type: "mimicReach", reaches: 1, col },
      { type: "mimicRoll", col },
      { type: "mimicClose", col },
    ]);
    expect(fx.hurt.value).toBe(0);
    expect(fx.peel.now + fx.flash.now).toBe(0);
  });

  it("forgets everything on a clear", () => {
    const fx = new MimicFx();
    noted(fx);
    said(fx, [enter, peel(0, 1), core, hit(1), spent]);
    fx.clear();
    expect(fx).toEqual(new MimicFx());
  });
});

/**
 * How many strokes a pose's frames lay, with the blow held off, so what
 * differs is the receipt itself and not the red the blow also brings — and
 * strokes, because the sparks it throws only fill.
 */
function receipt(role: ViewRole, arrange: (w: World) => void, thrown?: SimEvent): number {
  const off = [
    spyOn(BossHurt.prototype, "hit").mockImplementation(() => {}),
    spyOn(BossHurt.prototype, "jab").mockImplementation(() => {}),
  ];
  try {
    return count(frame(role, arrange, thrown), "set strokeStyle=");
  } finally {
    for (const spy of off) spy.mockRestore();
  }
}

describe("THE MIMIC's transients, drawn", () => {
  const signing = (w: World) => {
    posed(w, "sign", SIGN);
  };
  const bared = (w: World) => {
    posed(w, "core", CORE);
  };

  it.each(ROLES)("a peel draws its sign drifting off on the %s screen", (role) => {
    expect(receipt(role, signing, peel(1, 0))).toBeGreaterThan(receipt(role, signing));
  });

  it.each(ROLES)("a hit draws the core's flash on the %s screen", (role) => {
    expect(receipt(role, bared, hit(1))).toBeGreaterThan(receipt(role, bared));
  });
});
