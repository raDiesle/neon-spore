import { livingPath } from "../../../../../packages/content/src/body-path.js";
import type { CreatureSilhouette } from "../../../../../packages/content/src/silhouettes.js";
import { contourClock } from "../../../../../packages/render/src/creature-place.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import type { MagnetDraw } from "../../../../../packages/render/src/magnet.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * HOOKED — THE BARB's contour, kept so it can be held against the horseshoe
 * that replaced it.
 *
 * Seven lobes swept back into hooks around a body a little taller than it is
 * wide, at a depth half again the deepest else on the roster: that depth is
 * the whole shape, because the contour has to come a long way back between the
 * lobes or the points do not exist at forty pixels. Seven is the count it was
 * tuned to — a slick has two, a throb's rim six, a wisp five, a bulb nine — and
 * `tools/shape-sheet/test/nameability.test.ts` refused five, because a wisp is
 * five lobes on a round body at very nearly the same size and two bodies that
 * take the same spoken word is the one thing a body in this game may not be.
 *
 * It is here rather than in `packages/content` because the creature it was cut
 * for has left the field. What the sheet judges now is the horseshoe; this is
 * the drawing the pair can put beside it and say which one reads.
 */
const BARB: CreatureSilhouette = {
  lobes: 7,
  depth: 0.42,
  wobble: 0.03,
  rx: 48,
  ry: 54,
  seed: 3.7,
};

/**
 * The blob, in the body's own colour.
 *
 * That is the honest weakness of this candidate and it is worth saying at the
 * draw rather than only in the prose: a magnet carries **two** colours, and a
 * single contour has one place to put a colour. So the hooks are drawn in the
 * authored one — the left pole's — and the right pole is nowhere. A pair
 * looking at this card is being asked whether a shape that reads at arm's
 * length is worth a body that cannot say which trigger it takes.
 */
export function hooked(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, near } = d;
  const haze = (h: string): string => hazed(cfg, h, near);
  const red = c.color !== "cyan";
  const hex = haze(red ? PALETTE.red : PALETTE.cyan);
  const rim = haze(red ? PALETTE.redRim : PALETTE.cyanRim);
  const r = l.tile * 0.4;
  const scale = r / Math.max(BARB.rx, BARB.ry);
  const path = new Path2D(livingPath(BARB, contourClock(c.id, d.beats)));

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = hex;
  ctx.fill(path);
  ctx.lineWidth = STROKE.outline / scale;
  strokeGlow(ctx, path, rim, STROKE.outline / scale, 0.9);
  ctx.restore();
  halo(ctx, x, y, r * 1.2, hex, 0.35);
}
