import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Creature, DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { flatRadius } from "../src/creature-place.js";
import { burstFor } from "../src/effects-spark.js";
import { landingY } from "../src/landing.js";
import { bodyX, computeLayout, tileCY } from "../src/layout.js";
import { rockFallY } from "../src/rock-fall.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { rockRadius } from "../src/rock-size.js";
import { volleyBallRadius } from "../src/volley.js";
import { CORE_MUL } from "../src/volley-core.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The owner's report of 11 September 2026: *the meteor hits the ship and
 * disappears inside the ship, then jumps up and the crater is visible.* Two
 * halves. The field pass glided a rock to the hull row's **centre**, which is
 * under the membrane, so the hull painted over it for the end of its landing
 * beat; and the crater stayed shut under the stuck rock until it lifted off.
 * The rock now lands half-sunk in the skin, where `RockImpactFx` picks it up
 * without moving it, and the hole is open from the frame the rock arrives.
 *
 * His report of 22 September 2026 is the same defect seen from the living
 * bodies' side — *the first animation of red colour on the hull and the
 * electric wave is happening not in the exact moment the enemy damages the
 * ship* — so the rule stopped being the rock's. The last two cases below are
 * the pair: a rock rests by `rockRadius`, which `RockImpactFx` has to match to
 * the pixel, and everything else by the size it is drawn at.
 *
 * His third, the same day, is what the rest of that beat looks like — *it
 * touches the ship for some moments then switches to it* — and the case below
 * it holds the two halves of the answer apart: a living body is **off** the
 * plating through the middle of its last beat and **in** it by the end, so the
 * frame it is seen to touch is the frame the hull flashes.
 *
 * His fourth, 25 September 2026, is the rock's side of the third: *in the
 * exact moment the meteor hits the ship's skin top, the damage is taken
 * immediately.* A rock's last rows are bent so it touches the skin at the end
 * of its landing beat and not a beat early (`rock-fall.ts`), and it is pressed
 * into its hole by the replay after the hull has broken.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const BEAT_SECONDS = 60 / CFG.bpm;
const HULL = hullRow(CFG);

beforeAll(installCanvasGlobals);

function rock(kind: Creature["kind"], row: number, fromRow: number): Creature {
  return { id: 1, kind, col: 3, row, fromRow, color: null } as unknown as Creature;
}

describe("a landing beat", () => {
  const skin = () => L.hullY;
  const r = rockRadius(L, 1);
  const touching = L.hullY - r;
  const rest = L.hullY - r * 0.5;
  /** A one-tile-a-beat rock at fractional row `p`, where the field draws it. */
  const fall = (p: number) => {
    const c = rock("meteor", Math.ceil(p), Math.ceil(p) - 1);
    return landingY(L, CFG, c, 400, tileCY(L, p), p - c.fromRow, skin);
  };

  it("ends with a rock touching the skin, not in it or under it", () => {
    // The centre of the ship's row is below the skin — the first bug.
    expect(tileCY(L, HULL)).toBeGreaterThan(L.hullY);
    expect(fall(HULL)).toBeCloseTo(touching, 5);
    // And not a beat early: at the start of its landing beat the rock is well
    // clear of the plating, where the grid alone had it within a few pixels.
    expect(touching - fall(HULL - 1)).toBeGreaterThan(L.tile * 0.6);
  });

  it("hits at the grid's own speed, and never slows by more than a third", () => {
    const speed = (p: number) => (fall(p + 0.01) - fall(p)) / 0.01;
    // It does not brake into the ship: the last hundredth of a row is covered
    // at the pace every row above the bend is.
    expect(speed(HULL - 0.01)).toBeCloseTo(L.tile, 0);
    expect(speed(HULL - 9)).toBeCloseTo(L.tile, 5);
    for (let p = HULL - 9; p < HULL; p += 0.1) {
      expect(speed(p)).toBeGreaterThan(L.tile * (2 / 3));
      expect(speed(p)).toBeLessThanOrEqual(L.tile + 1e-6);
    }
  });

  it("throws a crater's puffs from the rock, not from its row", () => {
    // A shot rock in its bent rows leaves its hole where it is drawn at the
    // end of the beat (`effects-spark-hole.ts`); the row's centre is up to a
    // tile under it.
    for (let row = HULL - 6; row <= HULL; row++) {
      const hole = { type: "hole", col: 3, row, kind: "meteor", span: 1 } as const;
      const x = bodyX(L, 3, row);
      const c = rock("meteor", row, row - 1);
      const drawn = landingY(L, CFG, c, x, tileCY(L, row), 1, skin);
      expect(burstFor(hole, L, CFG, skin)?.y).toBeCloseTo(drawn, 5);
    }
    expect(tileCY(L, HULL - 1) - fall(HULL - 1)).toBeGreaterThan(L.tile * 0.5);
    // A moult's shell is not bent, and keeps its row.
    const shell = { type: "hole", col: 3, row: HULL - 1, kind: "moult", span: 1 } as const;
    expect(burstFor(shell, L, CFG, skin)?.y).toBe(tileCY(L, HULL - 1));
  });

  it("breaks THE VOLLEY's shell from the ball, not from its row", () => {
    // The ball bends onto the skin the same way a rock does (`rock-fall.ts`);
    // its shards and its burst squares (`volley-shards.ts`,
    // `effects-spark-worn.ts`) must leave from where it is drawn, not from the
    // row's centre it would otherwise fall from.
    for (let row = HULL - 6; row <= HULL; row++) {
      const ward = { type: "volleyReturn", id: 1, col: 3, row, left: 0 } as const;
      const hatch = { type: "volleyHatch", col: 3, row, kind: "volley", color: "red" } as const;
      const r = volleyBallRadius(L, CFG, 1, row);
      const drawn = rockFallY(L, row, tileCY(L, row), skin() - r);
      expect(burstFor(ward, L, CFG, skin)?.y).toBeCloseTo(drawn, 5);
      const rCore = r * CORE_MUL;
      const drawnCore = rockFallY(L, row, tileCY(L, row), skin() - rCore);
      expect(burstFor(hatch, L, CFG, skin)?.y).toBeCloseTo(drawnCore, 5);
    }
  });

  it("is where the replay takes the rock over, hit on its first frame", () => {
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
    // The first `translate` places the rock; the rest are its own look's,
    // relative to it (`drawRockBody`).
    expect(ys.length).toBeGreaterThan(0);
    // On the skin, a frame's worth into the press and less than half of it.
    const y0 = ys[0] as number;
    expect(y0).toBeGreaterThan(touching);
    expect(y0).toBeLessThan((touching + rest) / 2);
    // And a tenth of a second on it is in the hole it made.
    for (let i = 0; i < 5; i++) fx.update(1 / 60, L);
    ys.length = 0;
    fx.draw(ctx as unknown as CanvasRenderingContext2D, L, 6 / 60, skin);
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
    const c = rock("meteorFastest", HULL - 8, HULL - 11);
    const y = tileCY(L, HULL - 9.8);
    expect(landingY(L, CFG, c, 400, y, 0.4, skin)).toBe(y);
  });

  it("lifts a living body clear of the plating and drops it at the end", () => {
    // His third report the same day: *it touches the ship for some moments then
    // switches to it.* The row above the hull is one body-radius above the
    // plating, so the body arrives already lying on the ship and an even glide
    // would leave it there for the whole beat. The beat is a gather and a
    // strike instead, and the strike lands in its last ticks.
    const slick = rock("slick", HULL, HULL - 1);
    const r = flatRadius(L, CFG, slick, 1);
    const gap = (g: number) => L.hullY - landingY(L, CFG, slick, 400, 0, g, skin) - r;

    // It starts where the grid put it: touching the skin, which is the defect.
    expect(gap(0)).toBeLessThan(r * 0.2);
    // A finger's width of open sky under it at the top of the gather.
    expect(gap(0.4)).toBeGreaterThan(r * 0.6);
    // Still clear at four fifths of the beat, so the fall is all at the end.
    expect(gap(0.8)).toBeGreaterThan(0);
    // And in the plating by the time the hull answers.
    expect(gap(1)).toBeCloseTo(-r * 0.5, 5);
  });

  it("rests a living body on the skin too, by the size it is drawn at", () => {
    const slick = rock("slick", HULL, HULL - 1);
    const end = landingY(L, CFG, slick, 400, tileCY(L, HULL), 1, skin);
    // Its own radius, grown by the hull row's perspective (`depth.ts`) — not
    // the rock's, which is a different number on the same row.
    expect(end).toBeCloseTo(L.hullY - flatRadius(L, CFG, slick, 1) * 0.5, 5);
    // And that is the whole of the complaint: a tile of the ship's plating it
    // used to disappear behind before the hull flashed.
    expect(tileCY(L, HULL) - end).toBeGreaterThan(L.tile * 0.6);
  });
});
