import { beforeAll, describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { computeLayout, tileCY } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { rockLandingY } from "../src/rock-landing.js";
import { rockRadius } from "../src/torch.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The owner's report of 11 September 2026: *the meteor hits the ship and
 * disappears inside the ship, then jumps up and the crater is visible.* Two
 * halves. The field pass glided a rock to the hull row's **centre**, which is
 * under the membrane, so the hull painted over it for the end of its landing
 * beat; and the crater stayed shut under the stuck rock until it lifted off.
 * The rock now lands half-sunk in the skin, where `RockImpactFx` picks it up
 * without moving it, and the hole is open from the frame the rock arrives.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;
const HULL = hullRow(CFG);

beforeAll(installCanvasGlobals);

function rock(kind: Creature["kind"], row: number, fromRow: number): Creature {
  return { id: 1, kind, col: 3, row, fromRow, color: null } as unknown as Creature;
}

describe("a rock's landing beat", () => {
  const skin = () => L.hullY;
  const rest = L.hullY - rockRadius(L, 1) * 0.5;

  it("ends half-sunk in the skin, not on the hull row's centre under it", () => {
    const c = rock("meteor", HULL, HULL - 1);
    // The centre of the ship's row is below the skin — that is the whole bug.
    expect(tileCY(L, HULL)).toBeGreaterThan(L.hullY);
    const x = 400;
    const start = rockLandingY(L, c, x, tileCY(L, HULL - 1), 0, skin);
    const end = rockLandingY(L, c, x, tileCY(L, HULL), 1, skin);
    expect(start).toBeCloseTo(tileCY(L, HULL - 1), 5);
    expect(end).toBeCloseTo(rest, 5);
    // And it is one even glide between the two, not a stop at the skin.
    const mid = rockLandingY(L, c, x, 0, 0.5, skin);
    expect(mid).toBeCloseTo((start + end) / 2, 5);
  });

  it("is where the replay takes the rock over: stuck from its first frame", () => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    const ys: number[] = [];
    const origTranslate = ctx.translate.bind(ctx);
    ctx.translate = (...a: number[]) => {
      ys.push(a[1] as number);
      return origTranslate(...a);
    };
    let arrivals = 0;
    // The sim's `fromRow` on the beat it breaks the hull is the hull row.
    fx.spawn(400, L, 0, BEAT_SECONDS, "meteor", 1, HULL, true, () => {
      arrivals += 1;
    });
    fx.update(1 / 60, L);
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 1 / 60, skin);
    expect(arrivals).toBe(1);
    expect(ys).toHaveLength(1);
    expect(ys[0]).toBeCloseTo(rest, 5);
  });

  it("opens the crater the frame the rock arrives, not when it lifts off", () => {
    const fx = new RockImpactFx();
    const { ctx } = stubCanvas();
    fx.spawn(400, L, 0, BEAT_SECONDS, "meteor", 1, HULL, true, () => {});
    // Spawned and not yet drawn: nothing has arrived, the hole waits.
    expect(fx.coversCrater(400, L.tile)).toBe(true);
    fx.update(1 / 60, L);
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 1 / 60, skin);
    expect(fx.coversCrater(400, L.tile)).toBe(false);
  });

  it("leaves every higher row's glide alone", () => {
    const c = rock("meteorFastest", HULL - 2, HULL - 5);
    const y = tileCY(L, HULL - 3);
    expect(rockLandingY(L, c, 400, y, 0.4, skin)).toBe(y);
    // And a body that is not a rock, even on the hull row.
    const slick = rock("slick", HULL, HULL - 1);
    expect(rockLandingY(L, slick, 400, tileCY(L, HULL), 1, skin)).toBe(tileCY(L, HULL));
  });
});
