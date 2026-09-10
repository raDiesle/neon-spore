import {
  drawMotes,
  FAR,
  FAR_MOTES,
  hash01,
  tintFor,
} from "../../../../../packages/render/src/backdrop.js";
import type { BackdropDraw } from "../../../../../packages/render/src/backdrop-look.js";
import { bakedCache } from "../../../../../packages/render/src/baked.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * NEBULA — the field is in space: a deeper black, two slow clouds of the
 * act's colour a long way behind, and a few pin stars.
 *
 * The shipped back is a sea — light from above, dust in the water, a
 * horizon. The game is set in space and nothing on the field says so. This
 * paints a black a step deeper than the ground, then two large soft clouds
 * of the act's tint drifting very slowly in opposite directions far behind
 * everything, then the shipped far dust as it is, and six pin stars a little
 * brighter than the dust that breathe on their own clocks. No shafts, no
 * horizon, no wash: the clouds are the wash, and a cloud says *deep* the way
 * a horizon band says *floor*.
 *
 * Each cloud is one radial fade baked once per size and blitted — the
 * `light-shafts.ts` pattern — so there is no gradient in the loop, and its
 * position is `time` through `hash01`, so the two screens draw the same sky.
 *
 * **How it can lose.** *Colour behind a coloured body.* A red slick in front
 * of a red-tinted cloud is a body with less edge than it had, and the clouds
 * are the act's tint, which is close to some bodies on some waves. They are
 * kept very dim and very large for that reason; if a body still loses its
 * edge against one, the look is wrong however deep the space feels.
 */

/** The deeper black under the sky — a step past the ground's own, not a new
 * colour: the field's black with the ground's violet taken back out. */
const SPACE = "#06050C";

/** One cloud: where it sits as a share of the sky, how big it is as a share
 * of the width, how fast it drifts sideways in widths per second, and how
 * loud. Two, drifting opposite ways, so the sky turns without anything on
 * it seeming to travel. */
interface Cloud {
  readonly bx: number;
  readonly by: number;
  readonly size: number;
  readonly speed: number;
  readonly alpha: number;
}
const CLOUDS: readonly Cloud[] = [
  { bx: 0.3, by: 0.35, size: 1.1, speed: 0.004, alpha: 0.95 },
  { bx: 0.75, by: 0.7, size: 0.85, speed: -0.003, alpha: 0.8 },
];

/** How far a cloud's heart is lifted toward the dust's grey: the act's tints
 * are within a shade of black, and a cloud of one at any alpha over the
 * deeper black was there and could not be seen. */
const HEART_LIFT = 0.3;

/** Six pin stars: a place, a brightness, and a breath of their own. */
const STARS = 6;
const STAR_ALPHA: readonly [number, number] = [0.18, 0.32];
const STAR_BREATH = 0.35;

const cloudCache = bakedCache<string, HTMLCanvasElement>();

/** A soft disc of one tint, baked once per quantised size and tint. */
function cloudSprite(size: number, tint: string): HTMLCanvasElement {
  const px = Math.max(8, Math.round(size / 8) * 8);
  const key = `${px},${tint}`;
  const cached = cloudCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = px;
  c.height = px;
  const g = c.getContext("2d");
  if (g) {
    const r = px / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, mixHex(tint, PALETTE.sparkDim, HEART_LIFT));
    grad.addColorStop(0.35, tint);
    grad.addColorStop(0.65, `${tint}66`);
    grad.addColorStop(1, `${tint}00`);
    g.fillStyle = grad;
    g.fillRect(0, 0, px, px);
  }
  cloudCache.set(key, c);
  return c;
}

export function nebula(d: BackdropDraw): void {
  const { ctx, l, wave, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  ctx.fillStyle = SPACE;
  ctx.fillRect(0, 0, l.width, height);

  const tint = tintFor(wave);
  for (const cloud of CLOUDS) {
    const size = l.width * cloud.size;
    const sprite = cloudSprite(size, tint);
    // Wraps forever without ever going negative into `%`, the motes' way;
    // the wrap is 1.6 widths so a cloud leaves one edge before it enters the
    // other.
    const frac = cloud.bx + time * cloud.speed;
    const x = (frac - Math.floor(frac + 0.5)) * l.width * 1.6 + l.width / 2;
    const y = cloud.by * height;
    ctx.globalAlpha = cloud.alpha;
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;

  drawMotes(ctx, l, time, FAR, FAR_MOTES);

  ctx.fillStyle = PALETTE.sparkDim;
  for (let i = 0; i < STARS; i++) {
    const s = 20_000 + i * 4;
    const x = hash01(s + 1) * l.width;
    const y = hash01(s + 2) * height;
    const base = STAR_ALPHA[0] + hash01(s + 3) * (STAR_ALPHA[1] - STAR_ALPHA[0]);
    const breath = 1 - STAR_BREATH * (0.5 + 0.5 * Math.sin(time * (0.7 + hash01(s) * 0.9) + i));
    ctx.globalAlpha = base * breath;
    ctx.fillRect(x - 1, y - 1, 2, 2);
  }
  ctx.globalAlpha = 1;
}
