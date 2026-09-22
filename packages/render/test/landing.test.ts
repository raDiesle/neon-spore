import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Creature, DEFAULT_CONFIG, hullRow } from "@neon-spore/sim";
import { flatRadius } from "../src/creature-place.js";
import { landingY } from "../src/landing.js";
import { computeLayout, tileCY } from "../src/layout.js";
import { RockImpactFx } from "../src/rock-impact.js";
import { rockRadius } from "../src/rock-size.js";
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
  const rest = L.hullY - rockRadius(L, 1) * 0.5;

  it("ends half-sunk in the skin, not on the hull row's centre under it", () => {
    const c = rock("meteor", HULL, HULL - 1);
    // The centre of the ship's row is below the skin — that is the whole bug.
    expect(tileCY(L, HULL)).toBeGreaterThan(L.hullY);
    const x = 400;
    const start = landingY(L, CFG, c, x, tileCY(L, HULL - 1), 0, skin);
    const end = landingY(L, CFG, c, x, tileCY(L, HULL), 1, skin);
    expect(start).toBeCloseTo(tileCY(L, HULL - 1), 5);
    expect(end).toBeCloseTo(rest, 5);
    // And it is one even glide between the two, not a stop at the skin.
    const mid = landingY(L, CFG, c, x, 0, 0.5, skin);
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
    // The first `translate` places the rock; the rest are its own look's,
    // relative to it (`drawRockBody`).
    expect(ys.length).toBeGreaterThan(0);
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
    expect(landingY(L, CFG, c, 400, y, 0.4, skin)).toBe(y);
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
