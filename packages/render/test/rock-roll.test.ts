import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { stickStart, travelled } from "../src/rock-drift.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { rockRadius } from "../src/rock-size.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The owner, 25 September 2026: a rock leaving the hull should start moving
 * away much sooner, start slowly and gather speed the further it goes, roll
 * like a ball rather than shift to the side, and do some small damage on the
 * way. Each half of that is pinned here.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
/** A phone's field, which is what the pace is tuned against. */
const PHONE = computeLayout({ width: 390, height: 844, dpr: 3 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;

beforeAll(installCanvasGlobals);

describe("a rock leaving the hull", () => {
  const landed = { t: 0, fallLife: 0.1, embed: true, x0: 200, dir: 1 as const };
  const at = (s: number) => travelled({ ...landed, t: stickStart(landed) + s });

  it("lets go within a quarter of a second of landing", () => {
    expect(stickStart(landed) - landed.fallLife).toBeLessThanOrEqual(0.25);
  });

  it("starts slowly and keeps getting faster", () => {
    // The first tenth of a second barely moves it; every later tenth covers
    // more ground than the one before.
    expect(at(0.1)).toBeLessThan(5);
    let last = 0;
    for (let i = 1; i <= 12; i++) {
      const step = at(i / 10) - at((i - 1) / 10);
      expect(step).toBeGreaterThan(last);
      last = step;
    }
    // And on a phone it is gone from mid-field — half the field plus the
    // margin `driftedOffscreen` allows — inside about a second.
    expect(at(1.05)).toBeGreaterThan(PHONE.gridWidth * 0.8);
  });

  /** Runs one missed rock from impact until it has rolled `seconds` past
   * letting go, and returns what the last frame did: where the rock was
   * placed, how far it was turned, and the stroke colours it used. */
  const rollFor = (seconds: number) => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    let placed: number[] = [];
    let turns: number[] = [];
    let strokes: string[] = [];
    const translate = ctx.translate.bind(ctx);
    ctx.translate = (...a: number[]) => {
      placed.push(a[1] as number);
      return translate(...a);
    };
    const rotate = ctx.rotate.bind(ctx);
    ctx.rotate = (a: number) => {
      turns.push(a);
      return rotate(a);
    };
    const stroke = ctx.stroke.bind(ctx);
    ctx.stroke = (...a: unknown[]) => {
      strokes.push(String(ctx.strokeStyle));
      return (stroke as (...b: unknown[]) => void)(...a);
    };
    fx.spawn(200, L, 0, BEAT_SECONDS, "meteor", 1, CFG.rows - 1, true, () => {}, true, 7, 2);
    const skinAt = () => L.hullY;
    const dt = 1 / 120;
    let t = 0;
    const end = 0.3 + seconds;
    while (t < end) {
      t += dt;
      fx.update(dt, L);
      placed = [];
      turns = [];
      strokes = [];
      fx.draw(ctx as unknown as CanvasRenderingContext2D, L, t, skinAt);
    }
    // The rock is placed by the first `translate` and turned by the first
    // `rotate` after it; the marks are drawn before either.
    return { y: placed[0] ?? Number.NaN, turn: turns[0] ?? Number.NaN, strokes };
  };

  it("rolls on the skin rather than hovering over it", () => {
    expect(rollFor(0.5).y).toBeCloseTo(L.hullY - rockRadius(L, 1), 0);
  });

  it("turns as it rolls — further along, turned further", () => {
    // Rolling left, so turning anticlockwise: the turn goes down.
    expect(rollFor(0.35).turn - rollFor(0.6).turn).toBeGreaterThan(1);
  });

  it("leaves char marks on the skin behind it", () => {
    const { strokes } = rollFor(0.6);
    expect(strokes.filter((s) => s.startsWith("rgba(21,14,40,")).length).toBeGreaterThanOrEqual(3);
  });

  it("leaves no marks while it is still lodged in its hole", () => {
    const { strokes } = rollFor(0);
    expect(strokes.some((s) => s.startsWith("rgba(21,14,40,"))).toBe(false);
  });
});
