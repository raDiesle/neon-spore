import { describe, expect, it } from "bun:test";
import { crystalRadiusMul, METEOR, QUEEN_SHELL } from "@neon-spore/content";
import { DEFAULT_CONFIG, QUEEN_FLANK_TILES } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { QUEEN_FIGURE } from "../src/queen.js";
import { torchRadius } from "../src/torch.js";

/**
 * The queen's figure is not decoration: the whole of her rock mechanic rests
 * on one geometric claim — a torch that breaks off her wing has nothing of
 * her underneath it, so it drops straight out of the socket it sat in
 * instead of having to slide clear of her first (`spit` in sim/boss.ts).
 *
 * A claim like that cannot be held by a comment next to a number. It is
 * measured here, off the same `crystalRadiusMul` the shapes are drawn with,
 * over a wobble cycle long enough that no phase of it is missed — so nudging
 * a radius until the picture looks better either keeps the promise or says
 * out loud that it has stopped keeping it.
 */

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "test");
/** Torch radius in tiles, the unit everything in `QUEEN_FIGURE` is in. */
const TORCH_R = torchRadius(L) / L.tile;
/** The faint ember ring `drawTorchRock` draws just outside the rock's outline. */
const TORCH_RING = 1.14;
/** Enough phases of the wobble that the extreme of any of them is caught. */
const PHASES = 400;

/** Every vertex of a crystal, over the whole wobble, rotated by `rot`. */
function* vertices(
  shape: { sides: number; depth: number; wobble: number; seed: number },
  rx: number,
  ry: number,
  rot = 0,
): Generator<{ x: number; y: number }> {
  for (let p = 0; p < PHASES; p++) {
    const t = p * 0.05;
    for (let i = 0; i < shape.sides; i++) {
      const a = (i / shape.sides) * Math.PI * 2;
      const m = crystalRadiusMul(a, shape.sides, shape.depth, shape.wobble, t, shape.seed);
      const px = Math.cos(a) * rx * m;
      const py = Math.sin(a) * ry * m;
      yield {
        x: px * Math.cos(rot) - py * Math.sin(rot),
        y: px * Math.sin(rot) + py * Math.cos(rot),
      };
    }
  }
}

/** The lowest point a crystal centred at `cy` ever reaches, in tiles. */
function lowest(
  shape: { sides: number; depth: number; wobble: number; seed: number },
  cy: number,
  rx: number,
  ry: number,
  rot = 0,
): number {
  let low = -Infinity;
  for (const v of vertices(shape, rx, ry, rot)) low = Math.max(low, cy + v.y);
  return low;
}

/** The widest a crystal ever reaches from its own centre, in tiles. */
function widest(
  shape: { sides: number; depth: number; wobble: number; seed: number },
  rx: number,
  ry: number,
): number {
  let wide = -Infinity;
  for (const v of vertices(shape, rx, ry)) wide = Math.max(wide, Math.abs(v.x));
  return wide;
}

/** A torch sits at her own row, so its lowest point is its own reach down.
 * It is drawn at a facing derived from its screen x (`torchRotation`), which
 * is not knowable here — so every facing counts. */
function torchLowest(): number {
  let low = -Infinity;
  for (let r = 0; r < 64; r++) {
    const rot = (r / 64) * Math.PI * 2;
    low = Math.max(low, lowest(METEOR, 0, TORCH_R * TORCH_RING, TORCH_R * TORCH_RING, rot));
  }
  return low;
}

describe("the queen's figure", () => {
  const f = QUEEN_FIGURE;
  const torchLow = torchLowest();

  it("keeps every part of her above a flank torch's own lower edge", () => {
    const parts = [
      lowest(QUEEN_SHELL, f.bodyCy, f.bodyRx, f.bodyRy),
      lowest(QUEEN_SHELL, f.headCy, f.headRx, f.headRy),
      f.weakCy + f.weakR,
    ];
    for (const low of parts) expect(low).toBeLessThan(torchLow);
  });

  it("reaches the socket, so an egg rides a wing tip rather than floating beside her", () => {
    expect(widest(QUEEN_SHELL, f.bodyRx, f.bodyRy)).toBeGreaterThan(QUEEN_FLANK_TILES - TORCH_R);
  });

  it("half-buries the mark, and leaves the lower half of it out in the open", () => {
    const bodyLow = lowest(QUEEN_SHELL, f.bodyCy, f.bodyRx, f.bodyRy);
    expect(bodyLow).toBeGreaterThan(f.weakCy - f.weakR);
    expect(bodyLow).toBeLessThan(f.weakCy + f.weakR);
  });
});
