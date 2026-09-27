import * as skin from "../../../../../packages/render/src/living-skin.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "Every living
 * creature's light stands still while its outline wobbles". Every body that
 * goes through `drawLiving` wobbles its outline on the contour clock, and the
 * key light and the sheen on it sit at one place in the body the whole time:
 * lit beautifully, and a still life. Here the two slide together a little way
 * along the line to the key and back — the light moving *across* the flesh as
 * the flesh moves under it — which is the fix THE SINEW's organ and THE
 * BATON's drop already ship, one level up.
 *
 * The slide is along the key in the *field*: the transform carries the body's
 * rotation, so the offset is turned back by it, and a throb's spin still moves
 * the body under a light that stays where it is. `litRound` caches its sprite
 * by radius, and an offset moves the draw rather than the key, so this costs
 * no sprite.
 *
 * On a rate none of the contour's three terms (0.9, 0.53, 0.31) shares, so the
 * light is not read as the outline.
 */
const LIT_WOBBLE = 0.06;
const LIT_WOBBLE_RATE = 0.37;
/** The key stands up and to the left; the slide runs along it. */
const ALONG_X = -1;
const ALONG_Y = -0.8;

function driftingLight(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  rule: CanvasFillRule,
  p: skin.BodyPaint,
): void {
  const d = LIT_WOBBLE * Math.max(p.rx, p.ry) * Math.sin(p.t * LIT_WOBBLE_RATE);
  const cos = Math.cos(-p.rot);
  const sin = Math.sin(-p.rot);
  const fx = ALONG_X * d;
  const fy = ALONG_Y * d;
  skin.litSkin(ctx, path, rule, p, fx * cos - fy * sin, fx * sin + fy * cos);
}

export const SKIN_DRIFT: Variant = {
  slot: "creature:skin",
  name: "drift",
  sentence:
    "drift — the light on every living body slides a little toward the key and back as its outline wobbles, where today it sits still on the flesh",
  dir: "tools/versus/candidates/creature-skin/drift",
  patches: [
    patch({
      target: skin.LIVING_SKIN,
      reached: () => skin.LIVING_SKIN,
      where: {
        file: "packages/render/src/living-skin.ts",
        symbol: "LIVING_SKIN",
        type: "LivingSkin",
      },
      fields: { paint: driftingLight },
    }),
  ],
};
